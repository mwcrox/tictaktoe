'use strict';

function setupInsaneGame() {
    setupRoutedGameState();
    game.insaneQueues = Array.from({ length: 9 }, () => []);
}

// Insane Tic Tac Toe uses the Ultimate Tic Tac Toe routing rules, but each
// small board behaves like a tiny Infinite board with only three active pieces
// total. When a fourth piece is placed in a small board, that board's oldest
// active piece disappears immediately. Once a small board is won or closed, it
// stays closed for the rest of the game.
function playInsaneMove(boardIndex, cellIndex) {
    const mark = game.currentMark;
    const smallBoard = game.boards[boardIndex];
    const queue = game.insaneQueues[boardIndex];

    smallBoard[cellIndex] = mark;
    queue.push(cellIndex);

    let removed = null;
    if (queue.length > 3) {
        removed = queue.shift();
        smallBoard[removed] = '';
    }

    const smallWin = getWinningLine(smallBoard, mark);
    if (smallWin) {
        game.smallStatus[boardIndex] = mark;
        game.smallWinningCells[boardIndex] = smallWin;
        game.statusExtra = `${ownerLabel(game.markOwners[mark])} captured the ${BOARD_LABELS[boardIndex]} small board.`;
        if (removed !== null) {
            game.statusExtra += ' The oldest piece in that board disappeared first.';
        }
    } else if (removed !== null) {
        game.statusExtra = `The oldest piece in the ${BOARD_LABELS[boardIndex]} small board disappeared.`;
    }

    if (resolveInsaneOutcome(mark)) {
        return;
    }

    game.nextBoard = game.smallStatus[cellIndex] ? null : cellIndex;
    switchTurn();
}

function resolveInsaneOutcome(mark) {
    const metaLine = getMetaWinningLine(game.smallStatus, mark);
    if (metaLine) {
        game.overallWinningBoards = metaLine;
        finishGame(mark);
        return true;
    }

    if (game.smallStatus.every(Boolean)) {
        finishGame('CAT');
        return true;
    }

    return false;
}

function isFadedInsaneCell(boardIndex, cellIndex) {
    if (!game || game.mode !== 'insane' || game.gameOver) return false;
    if (game.smallStatus[boardIndex]) return false;
    if (!getAvailableBoards(game).includes(boardIndex)) return false;

    const queue = game.insaneQueues[boardIndex];
    return queue.length >= 3 && queue[0] === cellIndex;
}