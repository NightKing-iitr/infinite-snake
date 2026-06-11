# Repository Guidelines

## Project Structure & Module Organization

This is a static browser game with no build system. Core files live at the repository root:

- `index.html`: page structure, score display, canvas, and overlay controls.
- `style.css`: responsive layout, board sizing, overlay styling, and visual polish.
- `script.js`: game state, keyboard input, scoring, collision checks, food placement, and canvas drawing.
- `README.md`: player-facing overview and controls.

Keep new assets in a clearly named root-level folder such as `assets/` if image or audio files are added.

## Build, Test, and Development Commands

- Open `index.html` in a browser to run the game.
- `node --check script.js`: checks JavaScript syntax without executing browser-only code.

There is no package install, bundler, or production build step.

## Coding Style & Naming Conventions

Use plain HTML, CSS, and JavaScript. Match the existing style: two-space indentation in HTML/CSS blocks, semicolons in JavaScript, `camelCase` for variables/functions, and uppercase keys for state constants such as `states.GAME_OVER`.

Prefer small, focused functions for game behavior (`updateGame`, `drawSnake`, `setGameState`). Keep DOM IDs descriptive and stable, such as `gameCanvas`, `startButton`, and `highScore`.

## Testing Guidelines

At minimum, run `node --check script.js` after JavaScript edits. For changes to food placement or board occupancy logic, manually verify normal, nearly full, and full-board scenarios until automated tests are added.

Manual browser testing should cover start, pause/resume with Space, restart, game over, high score persistence, and no-scroll layout at desktop and mobile widths.

## Commit & Pull Request Guidelines

Recent commits use short, past-tense summaries, for example `Added readme file` and `Improved game style with overlays and start screen`. Keep commit messages concise and focused on the visible change.

Pull requests should include a brief description, testing performed, and screenshots or screen recordings for visual changes. Link related issues when applicable and call out any browser-specific behavior.

## Agent-Specific Instructions

Do not introduce a framework or dependency unless the project scope changes. Keep edits scoped to the static files and preserve direct browser execution through `index.html`.
