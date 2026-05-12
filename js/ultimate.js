'use strict';

function setupUltimateGame() {
    setupRoutedGameState();
}

function resolveUltimateOutcome(mark) {
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