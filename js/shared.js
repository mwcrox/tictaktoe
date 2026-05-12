'use strict';

function setupThreeByThreeGame() {
    game.board = Array(9).fill('');
}

function setupRoutedGameState() {
    game.boards = Array.from({ length: 9 }, () => Array(9).fill(''));
    game.smallStatus = Array(9).fill(null);
    game.smallWinningCells = Array.from({ length: 9 }, () => []);
    game.nextBoard = null;
}

function switchTurn() {
    game.currentMark = otherMark(game.currentMark);
}

function finishGame(result) {
    if (game.gameOver) return;

    const session = getSession(game.mode, game.opponent);
    game.gameOver = true;
    game.winner = result;
    game.isThinking = false;

    if (result === 'CAT') {
        session.scores.cat += 1;
    } else {
        const owner = game.markOwners[result];
        session.scores[owner] += 1;
    }

    session.nextStarterOwner = otherOwner(game.roundStarterOwner, game.opponent);
    saveSessions();
}

function getWinningLine(board, mark) {
    return WIN_LINES.find((line) => line.every((index) => board[index] === mark)) || null;
}

function getWinnerMark(board) {
    if (getWinningLine(board, 'X')) return 'X';
    if (getWinningLine(board, 'O')) return 'O';
    return null;
}

function getMetaWinningLine(statuses, mark) {
    return WIN_LINES.find((line) => line.every((index) => statuses[index] === mark)) || null;
}

function isBoardFull(board) {
    return board.every(Boolean);
}

function countSmallBoards(statuses) {
    return statuses.reduce((counts, status) => {
        if (status) counts[status] = (counts[status] || 0) + 1;
        return counts;
    }, { X: 0, O: 0, CAT: 0 });
}

function getOrderedMoves(board) {
    return [4, 0, 2, 6, 8, 1, 3, 5, 7].filter((index) => !board[index]);
}

function isComputerTurn() {
    if (!game || game.gameOver || game.opponent !== 'computer') return false;
    return game.markOwners[game.currentMark] === 'computer';
}

function getAssignmentText() {
    if (game.opponent === 'computer') {
        return `This round: You are ${markForOwner('human')}. The Entity is ${markForOwner('computer')}.`;
    }
    return `This round: Player 1 is ${markForOwner('player1')}. Player 2 is ${markForOwner('player2')}.`;
}

function markForOwner(owner) {
    if (!game) return '';
    if (game.markOwners.X === owner) return 'X';
    if (game.markOwners.O === owner) return 'O';
    return '';
}

function markSuffixForOwner(owner) {
    const mark = markForOwner(owner);
    return mark ? `(${mark})` : '';
}

function dotForOwner(owner) {
    const mark = markForOwner(owner);
    if (mark === 'X') return 'x';
    if (mark === 'O') return 'o';
    return 'cat';
}

function ownerLabel(owner) {
    const labels = {
        player1: 'Player 1',
        player2: 'Player 2',
        human: 'You',
        computer: 'The Entity'
    };
    return labels[owner] || owner;
}

function otherMark(mark) {
    return mark === 'X' ? 'O' : 'X';
}

function otherOwner(owner, opponent) {
    const players = opponent === 'computer' ? ['human', 'computer'] : ['player1', 'player2'];
    return owner === players[0] ? players[1] : players[0];
}

function defaultStarterFor(opponent) {
    return opponent === 'computer' ? 'human' : 'player1';
}

function getSessionKey(mode, opponent) {
    return `${mode}:${opponent}`;
}

function getSession(mode, opponent) {
    const key = getSessionKey(mode, opponent);
    if (!sessions[key]) {
        sessions[key] = makeDefaultSession(opponent);
    }

    const session = sessions[key];
    session.scores = Object.assign(defaultScores(), session.scores || {});

    const validOwners = opponent === 'computer' ? ['human', 'computer'] : ['player1', 'player2'];
    if (!validOwners.includes(session.nextStarterOwner)) {
        session.nextStarterOwner = defaultStarterFor(opponent);
    }

    return session;
}

function makeDefaultSession(opponent) {
    return {
        scores: defaultScores(),
        nextStarterOwner: defaultStarterFor(opponent)
    };
}

function defaultScores() {
    return {
        player1: 0,
        player2: 0,
        human: 0,
        computer: 0,
        cat: 0
    };
}

function getRoundLabel(session) {
    const completed = Object.values(session.scores).reduce((sum, value) => sum + value, 0);
    if (game.gameOver) {
        return `Round ${Math.max(1, completed)} complete`;
    }
    return `Round ${completed + 1}`;
}

function resetCurrentScores() {
    const mode = game ? game.mode : selectedMode;
    const opponent = game ? game.opponent : (MODES[selectedMode].supportsComputer ? selectedOpponent : 'two-player');
    const session = getSession(mode, opponent);
    session.scores = defaultScores();
    session.nextStarterOwner = defaultStarterFor(opponent);
    saveSessions();

    if (game) {
        game.statusExtra = 'Scores reset. The current board is still active.';
        renderApp();
    }
}

function loadSessions() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        return {};
    }
}

function saveSessions() {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
        // localStorage may be unavailable in some private browsing contexts.
    }
}

function cellName(index) {
    return `row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}`;
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}