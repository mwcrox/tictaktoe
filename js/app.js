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
            openPlayerPrompt(button.dataset.mode, button);
        });
    });

    els.promptOpponentButtons.forEach((button) => {
        button.addEventListener('click', () => {
            choosePromptOpponent(button.dataset.promptOpponent);
        });
    });

    els.promptCloseTargets.forEach((target) => {
        target.addEventListener('click', closePlayerPrompt);
    });

    els.promptCloseBtn.addEventListener('click', closePlayerPrompt);
    els.promptCancelBtn.addEventListener('click', closePlayerPrompt);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !els.playerPrompt.hidden) {
            closePlayerPrompt();
        }
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

    if (tabName !== 'play') {
        closePlayerPrompt(false);
    }
}

function updateMenu() {
    els.modeButtons.forEach((button) => {
        const isSelected = button.dataset.mode === selectedMode && !els.playerPrompt.hidden;
        button.classList.toggle('is-selected', isSelected);
        button.setAttribute('aria-pressed', String(isSelected));
    });

    document.body.classList.remove('playing-x', 'playing-o');
}

function openPlayerPrompt(mode, triggerButton) {
    selectedMode = mode;
    lastPromptTrigger = triggerButton || null;

    const config = MODES[mode];
    const supportsComputer = config.supportsComputer;

    els.promptTitle.textContent = config.title;
    els.playerPrompt.classList.toggle('two-player-only', !supportsComputer);

    if (supportsComputer) {
        els.promptDescription.textContent = `${config.preview} Choose whether to play Two Players or Vs The Entity.`;
        els.promptComputerBtn.hidden = false;
        els.promptComputerBtn.disabled = false;
    } else {
        els.promptDescription.textContent = `${config.preview} This mode is two-player only.`;
        els.promptComputerBtn.hidden = true;
        els.promptComputerBtn.disabled = true;
    }

    els.playerPrompt.hidden = false;
    document.body.classList.add('prompt-open');

    updateMenu();
    window.setTimeout(() => els.promptTwoPlayerBtn.focus(), 0);
}

function closePlayerPrompt(restoreFocus = true) {
    if (els.playerPrompt.hidden) return;

    els.playerPrompt.hidden = true;
    document.body.classList.remove('prompt-open');
    updateMenu();

    if (restoreFocus && lastPromptTrigger) {
        lastPromptTrigger.focus();
    }
}

function choosePromptOpponent(opponent) {
    const mode = selectedMode;

    if (opponent === 'computer' && !MODES[mode].supportsComputer) {
        return;
    }

    selectedOpponent = opponent;
    closePlayerPrompt(false);
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

    if (mode === 'insane') {
        setupInsaneGame();
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
    document.body.classList.remove('playing-x', 'playing-o', 'prompt-open');
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