'use strict';

let selectedMode = 'traditional';
let selectedOpponent = 'two-player';
let sessions = {};
let game = null;
let computerMoveToken = 0;

const els = {
    menuScreen: document.getElementById('menuScreen'),
    gameScreen: document.getElementById('gameScreen'),
    menuTabButtons: Array.from(document.querySelectorAll('[data-menu-tab]')),
    menuTabPanels: Array.from(document.querySelectorAll('.menu-tab-panel')),
    modeButtons: Array.from(document.querySelectorAll('[data-mode]')),
    opponentPanel: document.getElementById('opponentPanel'),
    opponentHint: document.getElementById('opponentHint'),
    opponentButtons: Array.from(document.querySelectorAll('[data-opponent]')),
    modePreview: document.getElementById('modePreview'),
    startGameBtn: document.getElementById('startGameBtn'),
    modeTitle: document.getElementById('modeTitle'),
    modeBadge: document.getElementById('modeBadge'),
    opponentBadge: document.getElementById('opponentBadge'),
    roundBadge: document.getElementById('roundBadge'),
    newGameBtn: document.getElementById('newGameBtn'),
    resetScoresBtn: document.getElementById('resetScoresBtn'),
    returnMenuBtn: document.getElementById('returnMenuBtn'),
    turnIndicator: document.getElementById('turnIndicator'),
    assignmentText: document.getElementById('assignmentText'),
    statusMessage: document.getElementById('statusMessage'),
    boardHost: document.getElementById('boardHost'),
    scoreGrid: document.getElementById('scoreGrid'),
    boardCountPanel: document.getElementById('boardCountPanel'),
    boardCountGrid: document.getElementById('boardCountGrid'),
    rulesText: document.getElementById('rulesText')
};