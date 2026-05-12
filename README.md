# Tic Tac Toe Arcade

A polished, static Tic Tac Toe game website built with only HTML, CSS, and vanilla JavaScript. It is fully compatible with GitHub Pages and also works by opening `index.html` directly in a browser.

## Description

Tic Tac Toe Arcade includes four playable game modes with responsive layout, turn-based background tinting, animated red X and blue O pieces, scoreboards, clear status messages, accessible board controls, and a dedicated Rules tab on the main menu.

No frameworks, build tools, package managers, backend code, databases, or external dependencies are required.

## Game Modes

1. **Traditional Tic Tac Toe**
   - Standard 3x3 Tic Tac Toe.
   - Supports two-player mode and computer mode.
   - Computer mode uses full minimax perfect play.
   - If the board fills with no winner, the winner is shown as CAT.

2. **Infinite Tic Tac Toe**
   - Standard 3x3 board.
   - Each player can have only three active pieces.
   - When a player places a fourth piece, that player's oldest piece disappears immediately.
   - The current player's oldest piece is faded before the move.
   - Supports two-player mode and computer mode.
   - Computer mode uses depth-limited minimax with queue simulation and strong heuristics.

3. **Ultimate Tic Tac Toe**
   - Uses a 3x3 grid of smaller 3x3 boards.
   - The cell a player chooses determines the next required small board.
   - If the required board is closed, the next player may choose any open board.
   - Win the overall game by winning three small boards in a row.
   - Two-player only.

4. **Tic-Tac-Ku**
   - Uses the same routed nine-board structure as Ultimate Tic Tac Toe.
   - The first player to win at least five small boards wins.
   - The five small boards do not need to be in a row.
   - Two-player only.

5. **Insane Tic Tac Toe**
   - Uses the same routed nine-board structure as Ultimate Tic Tac Toe.
   - Each small board behaves like an Infinite-style board.
   - Each small board may contain at most three active pieces total.
   - When a fourth piece is placed in a small board, that board's oldest active piece disappears immediately.
   - Once a small board is won or closed, it stays closed for the rest of the game.
   - Win the overall game by winning three small boards in a row.
   - Two-player only.

## Rules Summary

- Player 1 is X by default in round 1.
- Player 2 is O by default in round 1.
- In computer modes, the human player goes first in round 1.
- After each completed game, the starting player alternates.
- The starter is X for that round, so player symbols can swap between rounds.
- X pieces are always red.
- O pieces are always blue.
- CAT represents tied games.
- Scores are tracked per game mode and opponent type in the browser.
- The Rules tab on the main menu explains every mode before play begins.
- The in-game rules card shows the rules for the selected mode.


## File Responsibilities

- `index.html` contains the main menu, Play tab, Rules tab, game screen, scoreboard, controls, and board host elements.
- `styles.css` provides the responsive layout, gradient background, glass cards, animations, turn tinting, tabs, rules cards, and board styling.
- `js/config.js` stores shared constants, mode labels, preview text, and in-game rules text.
- `js/state.js` stores shared app state and DOM references.
- `js/shared.js` contains reusable board, scoring, session, and helper functions.
- `js/traditional.js` contains the standard 3x3 game logic and unbeatable minimax AI.
- `js/infinite.js` contains Infinite Tic Tac Toe queue/removal logic and AI search.
- `js/routed-board.js` contains shared routing logic for Ultimate Tic Tac Toe and Tic-Tac-Ku.
- `js/ultimate.js` contains Ultimate Tic Tac Toe overall win logic.
- `js/tictacku.js` contains Tic-Tac-Ku overall win logic.
- `js/ui.js` renders the board, status, scoreboard, counts, and current rules.
- `js/app.js` wires events together and starts new rounds.