'use strict';

function setupTicTacKuGame() {
    setupRoutedGameState();
}

function resolveTicTacKuOutcome(mark) {
    const counts = countSmallBoards(game.smallStatus);
    if ((counts[mark] || 0) >= 5) {
        finishGame(mark);
        return true;
    }

    if (game.smallStatus.every(Boolean)) {
        finishGame('CAT');
        return true;
    }

    return false;
}