'use strict';

let selectedMode = 'traditional';
let selectedOpponent = 'two-player';
let sessions = {};
let game = null;
let computerMoveToken = 0;
let lastPromptTrigger = null;

const els = {
    menuScreen: document.getElementById('menuScreen'),
    gameScreen: document.getElementById('gameScreen'),
    menuTabButtons: Array.from(document.querySelectorAll('[data-menu-tab]')),
    menuTabPanels: Array.from(document.querySelectorAll('.menu-tab-panel')),
    modeButtons: Array.from(document.querySelectorAll('[data-mode]')),
    playerPrompt: document.getElementById('playerPrompt'),
    promptTitle: document.getElementById('promptTitle'),
    promptDescription: document.getElementById('promptDescription'),
    promptTwoPlayerBtn: document.getElementById('promptTwoPlayerBtn'),
    promptComputerBtn: document.getElementById('promptComputerBtn'),
    promptCloseBtn: document.getElementById('promptCloseBtn'),
    promptCancelBtn: document.getElementById('promptCancelBtn'),
    promptCloseTargets: Array.from(document.querySelectorAll('[data-prompt-close]')),
    promptOpponentButtons: Array.from(document.querySelectorAll('[data-prompt-opponent]')),
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