'use strict';

function renderRoutedBoard() {
    const boardEl = document.createElement('div');
    boardEl.className = 'ultimate-board';
    boardEl.setAttribute('role', 'grid');
    boardEl.setAttribute('aria-label', `${MODES[game.mode].title} routed board`);

    const availableBoards = getAvailableBoards(game);

    game.boards.forEach((smallBoard, boardIndex) => {
        const status = game.smallStatus[boardIndex];
        const isAvailable = availableBoards.includes(boardIndex);
        const micro = document.createElement('div');
        micro.className = 'micro-board';
        micro.setAttribute('aria-label', `${BOARD_LABELS[boardIndex]} small board`);

        if (isAvailable && !game.gameOver) {
            micro.classList.add('is-available');
        }

        if (!isAvailable && !status && !game.gameOver) {
            micro.classList.add('is-muted');
        }

        if (status) {
            micro.classList.add('is-closed');
        }

        if (game.overallWinningBoards.includes(boardIndex)) {
            micro.classList.add('meta-win');
        }

        smallBoard.forEach((mark, cellIndex) => {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'micro-cell';
            cell.setAttribute('role', 'gridcell');
            cell.textContent = mark;

            if (mark) {
                cell.classList.add(mark === 'X' ? 'mark-x' : 'mark-o');
            }

            if (game.smallWinningCells[boardIndex].includes(cellIndex)) {
                cell.classList.add('win-cell');
            }

            cell.disabled = !canPlayRoutedCell(boardIndex, cellIndex);
            cell.setAttribute('aria-label', getRoutedCellLabel(boardIndex, cellIndex, mark));
            cell.addEventListener('click', () => handleRoutedCell(boardIndex, cellIndex));
            micro.appendChild(cell);
        });

        if (status) {
            const overlay = document.createElement('span');
            overlay.className = 'overlay';
            if (status === 'X') overlay.classList.add('mark-x');
            if (status === 'O') overlay.classList.add('mark-o');
            if (status === 'CAT') overlay.classList.add('mark-cat');
            overlay.textContent = status;
            micro.appendChild(overlay);
        }

        boardEl.appendChild(micro);
    });

    els.boardHost.appendChild(boardEl);
}

function handleRoutedCell(boardIndex, cellIndex) {
    if (!game || game.gameOver) return;

    if (!canPlayRoutedCell(boardIndex, cellIndex)) {
        game.statusExtra = 'That move is not available. Use a highlighted board and an empty cell.';
        renderApp();
        return;
    }

    game.statusExtra = '';
    playRoutedMove(boardIndex, cellIndex);
    renderApp();
}

// Ultimate Tic Tac Toe and Tic-Tac-Ku share the same routing rule:
// the cell chosen inside one small board selects the next required small board.
// If that destination board is already closed, the next player may choose any open board.
function playRoutedMove(boardIndex, cellIndex) {
    const mark = game.currentMark;
    const smallBoard = game.boards[boardIndex];
    smallBoard[cellIndex] = mark;

    const smallWin = getWinningLine(smallBoard, mark);
    if (smallWin) {
        game.smallStatus[boardIndex] = mark;
        game.smallWinningCells[boardIndex] = smallWin;
        game.statusExtra = `${ownerLabel(game.markOwners[mark])} captured the ${BOARD_LABELS[boardIndex]} small board.`;
    } else if (isBoardFull(smallBoard)) {
        game.smallStatus[boardIndex] = 'CAT';
        game.statusExtra = `The ${BOARD_LABELS[boardIndex]} small board is closed as CAT.`;
    }

    if (resolveRoutedGameOutcome(mark)) {
        return;
    }

    game.nextBoard = game.smallStatus[cellIndex] ? null : cellIndex;
    switchTurn();
}

function resolveRoutedGameOutcome(mark) {
    if (game.mode === 'ultimate') {
        return resolveUltimateOutcome(mark);
    }

    if (game.mode === 'tictacku') {
        return resolveTicTacKuOutcome(mark);
    }

    return false;
}

function canPlayRoutedCell(boardIndex, cellIndex) {
    if (!game || game.gameOver) return false;
    if (game.smallStatus[boardIndex]) return false;
    if (game.boards[boardIndex][cellIndex]) return false;
    return getAvailableBoards(game).includes(boardIndex);
}

function getAvailableBoards(targetGame) {
    if (targetGame.gameOver) return [];
    if (targetGame.nextBoard !== null && !targetGame.smallStatus[targetGame.nextBoard]) {
        return [targetGame.nextBoard];
    }

    return targetGame.smallStatus
        .map((status, index) => status ? null : index)
        .filter((index) => index !== null);
}

function getRoutingText() {
    const availableBoards = getAvailableBoards(game);
    if (availableBoards.length === 1) {
        return `Required board: ${BOARD_LABELS[availableBoards[0]]}.`;
    }
    return 'Any open small board is available.';
}

function getRoutedCellLabel(boardIndex, cellIndex, mark) {
    const row = Math.floor(cellIndex / 3) + 1;
    const column = (cellIndex % 3) + 1;
    const boardName = BOARD_LABELS[boardIndex];
    if (mark) {
        return `${boardName} small board, row ${row}, column ${column}: ${mark}.`;
    }
    if (canPlayRoutedCell(boardIndex, cellIndex)) {
        return `${boardName} small board, row ${row}, column ${column}: empty. Play ${game.currentMark}.`;
    }
    return `${boardName} small board, row ${row}, column ${column}: unavailable.`;
}