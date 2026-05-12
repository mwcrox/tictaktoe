'use strict';

function setupTraditionalGame() {
    setupThreeByThreeGame();
}

function playTraditionalMove(index) {
    game.board[index] = game.currentMark;
    const line = getWinningLine(game.board, game.currentMark);

    if (line) {
        game.winningCells = line;
        finishGame(game.currentMark);
        return;
    }

    if (isBoardFull(game.board)) {
        finishGame('CAT');
        return;
    }

    switchTurn();
}

function chooseTraditionalMove(board, aiMark) {
    const moves = getOrderedMoves(board);
    if (moves.length === 0) return null;

    let bestScore = -Infinity;
    let bestMove = moves[0];

    moves.forEach((move) => {
        const nextBoard = board.slice();
        nextBoard[move] = aiMark;
        const score = minimaxTraditional(nextBoard, otherMark(aiMark), aiMark, 0, -Infinity, Infinity);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });

    return bestMove;
}

// Perfect-play minimax for classic Tic Tac Toe. It searches the full game tree,
// so every possible human reply is considered before the computer chooses a move.
function minimaxTraditional(board, turnMark, aiMark, depth, alpha, beta) {
    const winner = getWinnerMark(board);
    if (winner) {
        return winner === aiMark ? 10 - depth : depth - 10;
    }

    if (isBoardFull(board)) {
        return 0;
    }

    const moves = getOrderedMoves(board);

    if (turnMark === aiMark) {
        let best = -Infinity;
        for (const move of moves) {
            board[move] = turnMark;
            best = Math.max(best, minimaxTraditional(board, otherMark(turnMark), aiMark, depth + 1, alpha, beta));
            board[move] = '';
            alpha = Math.max(alpha, best);
            if (beta <= alpha) break;
        }
        return best;
    }

    let best = Infinity;
    for (const move of moves) {
        board[move] = turnMark;
        best = Math.min(best, minimaxTraditional(board, otherMark(turnMark), aiMark, depth + 1, alpha, beta));
        board[move] = '';
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
    }
    return best;
}