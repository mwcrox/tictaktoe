'use strict';

function setupInfiniteGame() {
    setupThreeByThreeGame();
    game.queues = { X: [], O: [] };
    game.lastRemoved = null;
}

function playInfiniteMove(index) {
    const removed = applyInfiniteMove(game, game.currentMark, index);
    const line = getWinningLine(game.board, game.currentMark);

    if (line) {
        game.winningCells = line;
        finishGame(game.currentMark);
        return;
    }

    if (removed !== null) {
        game.statusExtra = `The oldest ${game.currentMark} disappeared from ${cellName(removed)}.`;
    }

    switchTurn();
}

function applyInfiniteMove(targetGame, mark, index) {
    targetGame.board[index] = mark;
    targetGame.queues[mark].push(index);

    let removed = null;
    if (targetGame.queues[mark].length > 3) {
        removed = targetGame.queues[mark].shift();
        targetGame.board[removed] = '';
    }

    targetGame.lastRemoved = removed;
    return removed;
}

function getFadedInfiniteIndex() {
    if (!game || game.mode !== 'infinite' || game.gameOver) return null;
    const queue = game.queues[game.currentMark];
    return queue.length >= 3 ? queue[0] : null;
}

function chooseInfiniteMove(currentGame) {
    const aiMark = currentGame.currentMark;
    const state = {
        board: currentGame.board.slice(),
        queues: {
            X: currentGame.queues.X.slice(),
            O: currentGame.queues.O.slice()
        }
    };

    const moves = getInfiniteLegalMoves(state.board);
    if (moves.length === 0) return null;

    const activePieces = state.board.filter(Boolean).length;

    // Strong opening book for speed and stability.
    if (activePieces === 0 && state.board[4] === '') return 4;
    if (activePieces === 1) {
        if (state.board[4] === '') return 4;
        const corner = [0, 2, 6, 8].find((index) => state.board[index] === '');
        if (corner !== undefined) return corner;
    }

    for (const move of moves) {
        const next = simulateInfiniteState(state, aiMark, move);
        if (getWinnerMark(next.board) === aiMark) {
            return move;
        }
    }

    const depthLimit = activePieces < 3 ? 8 : activePieces < 5 ? 10 : 12;
    const memo = new Map();
    let bestMove = moves[0];
    let bestScore = -Infinity;

    const orderedMoves = orderInfiniteMoves(state, aiMark, aiMark);
    for (const move of orderedMoves) {
        const next = simulateInfiniteState(state, aiMark, move);
        const score = infiniteMinimax(next, otherMark(aiMark), aiMark, depthLimit - 1, -Infinity, Infinity, memo, new Set());
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

// Infinite Tic Tac Toe has a moving queue for each player's pieces. The search
// below simulates those queues, including the oldest-piece removal after a
// fourth placement. Because this variant can cycle, repeated states are treated
// as neutral draws inside the search path, and a strong heuristic evaluates the
// depth limit.
function infiniteMinimax(state, turnMark, aiMark, depth, alpha, beta, memo, path) {
    const winner = getWinnerMark(state.board);
    if (winner) {
        return winner === aiMark ? 100000 + depth : -100000 - depth;
    }

    if (depth <= 0) {
        return evaluateInfiniteState(state, aiMark);
    }

    const key = encodeInfiniteState(state, turnMark);
    if (path.has(key)) {
        return 0;
    }

    const memoKey = `${key}|${depth}`;
    if (memo.has(memoKey)) {
        return memo.get(memoKey);
    }

    path.add(key);
    const moves = orderInfiniteMoves(state, turnMark, aiMark);

    if (turnMark === aiMark) {
        let value = -Infinity;
        for (const move of moves) {
            const next = simulateInfiniteState(state, turnMark, move);
            value = Math.max(value, infiniteMinimax(next, otherMark(turnMark), aiMark, depth - 1, alpha, beta, memo, path));
            alpha = Math.max(alpha, value);
            if (beta <= alpha) break;
        }
        path.delete(key);
        memo.set(memoKey, value);
        return value;
    }

    let value = Infinity;
    for (const move of moves) {
        const next = simulateInfiniteState(state, turnMark, move);
        value = Math.min(value, infiniteMinimax(next, otherMark(turnMark), aiMark, depth - 1, alpha, beta, memo, path));
        beta = Math.min(beta, value);
        if (beta <= alpha) break;
    }
    path.delete(key);
    memo.set(memoKey, value);
    return value;
}

function simulateInfiniteState(state, mark, move) {
    const board = state.board.slice();
    const queues = {
        X: state.queues.X.slice(),
        O: state.queues.O.slice()
    };

    board[move] = mark;
    queues[mark].push(move);

    if (queues[mark].length > 3) {
        const removed = queues[mark].shift();
        board[removed] = '';
    }

    return { board, queues };
}

function evaluateInfiniteState(state, aiMark) {
    const winner = getWinnerMark(state.board);
    if (winner) {
        return winner === aiMark ? 100000 : -100000;
    }

    const opponent = otherMark(aiMark);
    const aiImmediate = getImmediateWinningMoves(state, aiMark).length;
    const opponentImmediate = getImmediateWinningMoves(state, opponent).length;

    let score = 0;
    score += evaluateLinesForMark(state.board, aiMark, opponent);
    score -= evaluateLinesForMark(state.board, opponent, aiMark);
    score += aiImmediate * 520;
    score -= opponentImmediate * 620;
    score += Math.max(0, aiImmediate - 1) * 360;
    score -= Math.max(0, opponentImmediate - 1) * 420;
    score -= getRemovalRisk(state, aiMark, opponent) * 0.9;
    score += getRemovalRisk(state, opponent, aiMark) * 0.9;

    state.board.forEach((mark, index) => {
        if (mark === aiMark) score += POSITION_WEIGHTS[index] * 8;
        if (mark === opponent) score -= POSITION_WEIGHTS[index] * 8;
    });

    return score;
}

function evaluateLinesForMark(board, mark, opponent) {
    let score = 0;

    WIN_LINES.forEach((line) => {
        const markCount = line.filter((index) => board[index] === mark).length;
        const opponentCount = line.filter((index) => board[index] === opponent).length;
        if (opponentCount > 0) return;

        if (markCount === 1) score += 14;
        if (markCount === 2) score += 110;
        if (line.includes(4) && markCount > 0) score += 8;
    });

    return score;
}

function getRemovalRisk(state, mark, opponent) {
    const queue = state.queues[mark];
    if (!queue || queue.length < 3) return 0;

    const oldest = queue[0];
    let risk = 0;

    WIN_LINES.forEach((line) => {
        if (!line.includes(oldest)) return;
        const markCount = line.filter((index) => state.board[index] === mark).length;
        const opponentCount = line.filter((index) => state.board[index] === opponent).length;
        if (opponentCount > 0) return;
        if (markCount === 1) risk += 18;
        if (markCount === 2) risk += 110;
    });

    return risk;
}

function getImmediateWinningMoves(state, mark) {
    return getInfiniteLegalMoves(state.board).filter((move) => {
        const next = simulateInfiniteState(state, mark, move);
        return getWinnerMark(next.board) === mark;
    });
}

function orderInfiniteMoves(state, turnMark, aiMark) {
    const moves = getInfiniteLegalMoves(state.board);
    return moves
        .map((move) => {
            const next = simulateInfiniteState(state, turnMark, move);
            return { move, score: quickInfiniteScore(next, aiMark, move) };
        })
        .sort((a, b) => turnMark === aiMark ? b.score - a.score : a.score - b.score)
        .map((entry) => entry.move);
}

function quickInfiniteScore(state, aiMark, move) {
    const winner = getWinnerMark(state.board);
    if (winner) return winner === aiMark ? 100000 : -100000;

    const opponent = otherMark(aiMark);
    let score = POSITION_WEIGHTS[move] * 5;
    score += evaluateLinesForMark(state.board, aiMark, opponent) * 0.7;
    score -= evaluateLinesForMark(state.board, opponent, aiMark) * 0.7;
    return score;
}

function getInfiniteLegalMoves(board) {
    return board
        .map((mark, index) => mark ? null : index)
        .filter((index) => index !== null);
}

function encodeInfiniteState(state, turnMark) {
    return `${state.board.map((mark) => mark || '-').join('')}|X:${state.queues.X.join(',')}|O:${state.queues.O.join(',')}|T:${turnMark}`;
}