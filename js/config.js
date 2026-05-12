'use strict';

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const BOARD_LABELS = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right'
];

const POSITION_WEIGHTS = [3, 2, 3, 2, 6, 2, 3, 2, 3];
const STORAGE_KEY = 'tic-tac-toe-arcade-sessions-v2';

const MODES = {
  traditional: {
    title: 'Traditional Tic Tac Toe',
    badge: 'Classic 3x3',
    supportsComputer: true,
    preview: 'Classic 3x3 Tic Tac Toe with perfect minimax play when facing The Entity.'
  },
  infinite: {
    title: 'Infinite Tic Tac Toe',
    badge: 'Three active pieces',
    supportsComputer: true,
    preview: 'Each player can keep only three active pieces. The Entity simulates disappearing pieces when it searches moves.'
  },
  ultimate: {
    title: 'Ultimate Tic Tac Toe',
    badge: 'Nine boards',
    supportsComputer: false,
    preview: 'Two-player only. Each move sends the next player to the matching small board. Win three small boards in a row.'
  },
  tictacku: {
    title: 'Tic-Tac-Ku',
    badge: 'First to five',
    supportsComputer: false,
    preview: 'Two-player only. Route moves like Ultimate Tic Tac Toe, but the first player to win five small boards wins.'
  },
  insane: {
    title: 'Insane Tic Tac Toe',
    badge: 'Infinite small boards',
    supportsComputer: false,
    preview: 'Two-player only. Play the big board like Ultimate Tic Tac Toe, but each small board can hold only three active pieces total.'
  }
};

const RULES_HTML = {
  traditional: `
    <ul>
      <li>Players take turns placing red X and blue O pieces on a 3x3 board.</li>
      <li>The first player to make three in a row wins.</li>
      <li>If the board fills with no winner, the winner is shown as CAT and the CAT score increases.</li>
      <li>When playing The Entity, it uses full minimax perfect play and should never lose.</li>
      <li>The first player alternates after each completed game. The starter is always X for that round.</li>
    </ul>
  `,
  infinite: `
    <ul>
      <li>The board is 3x3, but each player may have only three active pieces.</li>
      <li>When a player places a fourth piece, that player's oldest piece disappears immediately.</li>
      <li>The faded piece is the current player's oldest active piece and will disappear after their move.</li>
      <li>Wins are checked after the new piece is placed and the old piece, if any, disappears.</li>
      <li>The Entity uses depth-limited minimax with queue simulation, threat detection, and strong heuristics.</li>
    </ul>
  `,
  ultimate: `
    <ul>
      <li>Ultimate Tic Tac Toe is two-player only.</li>
      <li>Play on a 3x3 grid of smaller 3x3 boards.</li>
      <li>The cell you choose sends the next player to the matching small board.</li>
      <li>If that required board is won or full, the next player may choose any open board.</li>
      <li>Win a small board by making three in a row inside it.</li>
      <li>Win the overall game by winning three small boards in a row.</li>
      <li>If all small boards close with no overall winner, the winner is CAT.</li>
    </ul>
  `,
  tictacku: `
    <ul>
      <li>Tic-Tac-Ku is two-player only.</li>
      <li>Tic-Tac-Ku uses the same nine-board move routing as Ultimate Tic Tac Toe.</li>
      <li>The cell you choose sends the next player to the matching small board.</li>
      <li>If that required board is won or full, the next player may choose any open board.</li>
      <li>Win small boards by making three in a row inside them.</li>
      <li>The first player to win at least five small boards wins. The five boards do not need to be in a row.</li>
      <li>If all small boards close and neither player has five, the winner is CAT.</li>
    </ul>
  `,
  insane: `
    <ul>
      <li>Insane Tic Tac Toe is two-player only.</li>
      <li>It uses the same nine-board move routing as Ultimate Tic Tac Toe.</li>
      <li>The cell you choose sends the next player to the matching small board.</li>
      <li>If that required board is already closed, the next player may choose any open board.</li>
      <li>Inside each small board, there may be only three active pieces total.</li>
      <li>When a fourth piece is placed in a small board, that board's oldest active piece disappears immediately.</li>
      <li>The faded piece shows which active piece would disappear if you play in that small board.</li>
      <li>A small board closes only when a player wins it. Once closed, it stays closed for the rest of the game.</li>
      <li>Win the overall game by winning three closed small boards in a row. If all small boards close with no overall winner, the winner is CAT.</li>
    </ul>
  `
};