'use strict';

function renderApp() {
    if (!game) return;

    setBodyTurnTint();

    const config = MODES[game.mode];
    const session = getSession(game.mode, game.opponent);

    els.modeTitle.textContent = config.title;
    els.modeBadge.textContent = config.badge;
    els.opponentBadge.textContent = game.opponent === 'computer' ? 'Vs Computer' : 'Two Players';
    els.roundBadge.textContent = getRoundLabel(session);
    els.assignmentText.textContent = getAssignmentText();
    els.rulesText.innerHTML = RULES_HTML[game.mode];

    renderTurnIndicator();
    renderStatusMessage();
    renderScoreboard(session);
    renderBoardCounts();
    renderBoard();
}

function setBodyTurnTint() {
    document.body.classList.remove('playing-x', 'playing-o');
    if (!game || game.gameOver) return;
    document.body.classList.add(game.currentMark === 'X' ? 'playing-x' : 'playing-o');
}

function renderTurnIndicator() {
    els.turnIndicator.classList.remove('x-turn', 'o-turn');

    if (game.gameOver) {
        if (game.winner === 'CAT') {
            els.turnIndicator.textContent = 'Winner: CAT';
        } else {
            els.turnIndicator.textContent = `Winner: ${ownerLabel(game.markOwners[game.winner])} (${game.winner})`;
        }
        return;
    }

    const owner = game.markOwners[game.currentMark];
    els.turnIndicator.textContent = `${ownerLabel(owner)} (${game.currentMark}) to move`;
    els.turnIndicator.classList.add(game.currentMark === 'X' ? 'x-turn' : 'o-turn');
}

function renderStatusMessage() {
    if (game.gameOver) {
        if (game.winner === 'CAT') {
            els.statusMessage.textContent = 'Winner: CAT. This round is a tie and the CAT score has been updated.';
            return;
        }

        const owner = game.markOwners[game.winner];
        els.statusMessage.textContent = `${ownerLabel(owner)} wins with ${game.winner}! Start a new game to play the next round.`;
        return;
    }

    const owner = game.markOwners[game.currentMark];
    const current = `${ownerLabel(owner)} (${game.currentMark})`;
    let message = '';

    if (game.isThinking) {
        message = `Computer is choosing a move for ${game.currentMark}.`;
    } else if (game.mode === 'traditional') {
        message = `${current} to move. Get three in a row to win.`;
    } else if (game.mode === 'infinite') {
        const queue = game.queues[game.currentMark];
        if (queue.length >= 3) {
            message = `${current} to move. The faded ${game.currentMark} is the oldest active piece and will disappear after this move.`;
        } else {
            message = `${current} to move. Each player may keep up to three active pieces.`;
        }
    } else {
        message = `${current} to move. ${getRoutingText()}`;
    }

    if (game.statusExtra) {
        message += ` ${game.statusExtra}`;
    }

    els.statusMessage.textContent = message;
}

function renderScoreboard(session) {
    const rows = [];

    if (game.opponent === 'computer') {
        rows.push({ label: `You ${markSuffixForOwner('human')}`, value: session.scores.human, dot: dotForOwner('human') });
        rows.push({ label: `Computer ${markSuffixForOwner('computer')}`, value: session.scores.computer, dot: dotForOwner('computer') });
    } else {
        rows.push({ label: `Player 1 ${markSuffixForOwner('player1')}`, value: session.scores.player1, dot: dotForOwner('player1') });
        rows.push({ label: `Player 2 ${markSuffixForOwner('player2')}`, value: session.scores.player2, dot: dotForOwner('player2') });
    }

    rows.push({ label: 'CAT', value: session.scores.cat, dot: 'cat' });

    els.scoreGrid.innerHTML = rows.map((row) => scoreRowHTML(row)).join('');
}

function renderBoardCounts() {
    const showCounts = game.mode === 'ultimate' || game.mode === 'tictacku';
    els.boardCountPanel.hidden = !showCounts;
    if (!showCounts) return;

    const counts = countSmallBoards(game.smallStatus);
    const rows = [];

    rows.push({ label: `Player 1 ${markSuffixForOwner('player1')}`, value: counts[markForOwner('player1')] || 0, dot: dotForOwner('player1') });
    rows.push({ label: `Player 2 ${markSuffixForOwner('player2')}`, value: counts[markForOwner('player2')] || 0, dot: dotForOwner('player2') });
    rows.push({ label: 'Closed CAT', value: counts.CAT || 0, dot: 'cat' });

    els.boardCountGrid.innerHTML = rows.map((row) => scoreRowHTML(row)).join('');
}

function scoreRowHTML(row) {
    const safeLabel = escapeHTML(row.label.trim());
    return `
    <div class="score-row">
      <span class="score-name"><span class="score-dot ${row.dot}"></span>${safeLabel}</span>
      <span class="score-value">${row.value}</span>
    </div>
  `;
}

function renderBoard() {
    els.boardHost.innerHTML = '';
    if (game.mode === 'traditional' || game.mode === 'infinite') {
        renderStandardBoard();
    } else {
        renderRoutedBoard();
    }
}

function renderStandardBoard() {
    const boardEl = document.createElement('div');
    boardEl.className = 'standard-board';
    boardEl.setAttribute('role', 'grid');
    boardEl.setAttribute('aria-label', `${MODES[game.mode].title} board`);

    const fadedIndex = getFadedInfiniteIndex();

    game.board.forEach((mark, index) => {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell';
        cell.setAttribute('role', 'gridcell');
        cell.textContent = mark;

        if (mark) {
            cell.classList.add(mark === 'X' ? 'mark-x' : 'mark-o');
        }

        if (game.winningCells.includes(index)) {
            cell.classList.add('win-cell');
        }

        if (fadedIndex === index) {
            cell.classList.add('is-oldest');
        }

        cell.disabled = game.gameOver || Boolean(mark) || isComputerTurn();
        cell.setAttribute('aria-label', getStandardCellLabel(index, mark));
        cell.addEventListener('click', () => handleStandardCell(index));
        boardEl.appendChild(cell);
    });

    els.boardHost.appendChild(boardEl);
}

function handleStandardCell(index) {
    if (!game || game.gameOver || isComputerTurn()) return;

    if (game.board[index]) {
        game.statusExtra = 'That cell is already occupied.';
        renderApp();
        return;
    }

    game.statusExtra = '';
    playStandardMove(index);
    renderApp();
    scheduleComputerMove();
}

function playStandardMove(index) {
    if (game.mode === 'traditional') {
        playTraditionalMove(index);
        return;
    }

    if (game.mode === 'infinite') {
        playInfiniteMove(index);
    }
}

function getStandardCellLabel(index, mark) {
    const row = Math.floor(index / 3) + 1;
    const column = (index % 3) + 1;
    if (mark) {
        return `Row ${row}, column ${column}: ${mark}.`;
    }
    return `Row ${row}, column ${column}: empty. Play ${game.currentMark}.`;
}