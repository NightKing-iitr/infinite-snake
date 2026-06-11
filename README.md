# Infinite Snake

A browser-based Snake game with wraparound edges, pause support, high score tracking, and canvas-rendered visuals.

## Run

Open `index.html` in a browser.

No build step, package install, or local server is required.

## Controls

- Arrow keys: Move the snake
- Swipe on the board: Move the snake on touch screens
- Touch direction buttons: Move the snake on mobile
- Space: Pause or resume
- Pause button: Pause or resume on touch screens
- Start: Begin from the start screen
- Restart: Start a new game from the pause or game-over overlay

## Features

- Start screen
- Game-over overlay
- Pause and resume
- Edge wraparound movement
- Self-collision detection
- Persistent high score using `localStorage`
- Responsive, no-scroll layout
- Canvas visuals with grid, glow effects, rounded snake body, and food highlight

## Project Structure

- `index.html`: Game markup and overlay UI
- `style.css`: Layout, responsive styling, and overlay presentation
- `script.js`: Game state, input handling, scoring, collision logic, and canvas drawing
