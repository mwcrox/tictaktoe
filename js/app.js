'use strict';

init();

function init() {
    sessions = loadSessions();

    els.menuTabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            showMenuTab(button.dataset.menuTab);
        });
    });

    els.modeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            selectedMode = button.dataset.mode;
            if (!MODES[selectedMode].supportsComputer) {
                selectedOpponent = 'two-player';
            }
            updateMenu();
        });
    });

    els.opponentButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (button.disabled) return;
            selectedOpponent = button.dataset.opponent;
            updateMenu();
        });
    });

    els.startGameBtn.addEventListener('click', () => {
        startRoundFromSelection();
    });

    els.newGameBtn.addEventListener('click', () => {
        if (!game) return;
        startRound(game.mode, game.opponent);
    });

    els.resetScoresBtn.addEventListener('click', () => {
        resetCurrentScores();
    });

    els.returnMenuBtn.addEventListener('click', () => {
        returnToMenu();
    });

    updateMenu();
}

function showMenuTab(tabName) {
    els.menuTabButtons.forEach((button) => {
        const isSelected = button.dataset.menuTab === tabName;
        button.classList.toggle('is-selected', isSelected);
        button.setAttribute('aria-selected', String(isSelected));
    });

    els.menuTabPanels.forEach((panel) => {
        panel.hidden = panel.id !== `${tabName}TabPanel`;
    });
}

function updateMenu() {
    els.modeButtons.forEach((button) => {
        const isSelected = button.dataset.mode === selectedMode;
        button.classList.toggle('is-selected', isSelected);
        button.setAttribute('aria-pressed', String(isSelected));
    });

    const supportsComputer = MODES[selectedMode].supportsComputer;
    els.opponentHint.textContent = supportsComputer
        ? 'Traditional and Infinite modes support two-player games or battles against The Entity.'
        : 'This mode is two-player only.';

    els.opponentButtons.forEach((button) => {
        const isComputerButton = button.dataset.opponent === 'computer';
        button.disabled = !supportsComputer && isComputerButton;
        const isSelected = button.dataset.opponent === selectedOpponent;
        button.classList.toggle('is-selected', isSelected);
        button.setAttribute('aria-pressed', String(isSelected));
    });

    els.modePreview.textContent = MODES[selectedMode].preview;
    document.body.classList.remove('playing-x', 'playing-o');
}

function startRoundFromSelection() {
    const mode = selectedMode;
    const opponent = MODES[mode].supportsComputer ? selectedOpponent : 'two-player';
    startRound(mode, opponent);
}

function startRound(mode, opponent) {
    computerMoveToken += 1;

    const session = getSession(mode, opponent);
    const starter = session.nextStarterOwner || defaultStarterFor(opponent);
    const second = otherOwner(starter, opponent);

    game = {
        mode,
        opponent,
        sessionKey: getSessionKey(mode, opponent),
        currentMark: 'X',
        markOwners: { X: starter, O: second },
        roundStarterOwner: starter,
        gameOver: false,
        winner: null,
        winningCells: [],
        overallWinningBoards: [],
        statusExtra: '',
        isThinking: false
    };

    if (mode === 'traditional') {
        setupTraditionalGame();
    }

    if (mode === 'infinite') {
        setupInfiniteGame();
    }

    if (mode === 'ultimate') {
        setupUltimateGame();
    }

    if (mode === 'tictacku') {
        setupTicTacKuGame();
    }

    els.menuScreen.hidden = true;
    els.gameScreen.hidden = false;
    renderApp();
    scheduleComputerMove();
}

function returnToMenu() {
    computerMoveToken += 1;
    if (game) {
        game.isThinking = false;
    }
    game = null;
    els.gameScreen.hidden = true;
    els.menuScreen.hidden = false;
    document.body.classList.remove('playing-x', 'playing-o');
    updateMenu();
}

function scheduleComputerMove() {
    if (!isComputerTurn() || game.isThinking) return;

    const token = ++computerMoveToken;
    const mode = game.mode;
    const sessionKey = game.sessionKey;
    game.isThinking = true;
    renderApp();

    window.setTimeout(() => {
        if (!game || game.gameOver || token !== computerMoveToken || game.sessionKey !== sessionKey || !isComputerTurn()) {
            return;
        }

        let move = null;
        if (mode === 'traditional') {
            move = chooseTraditionalMove(game.board, game.currentMark);
        } else if (mode === 'infinite') {
            move = chooseInfiniteMove(game);
        }

        game.isThinking = false;

        if (move !== null && move !== undefined) {
            playStandardMove(move);
        }

        renderApp();
    }, 220);
}