# Project Plan

## Current State

Infinite Snake is currently a static, single-player browser game. It runs directly from `index.html` with no build step, package install, or backend server. The game logic is in `script.js`, rendering is done on a canvas, and styling is handled by `style.css`.

## Completed Features

- [x] Static browser-based Snake game
- [x] Canvas-rendered board
- [x] Start screen
- [x] Restart action from overlay
- [x] Pause and resume with Space
- [x] Game-over overlay
- [x] Persistent high score using `localStorage`
- [x] Edge wraparound movement
- [x] Self-collision detection
- [x] Glowing food and improved board visuals
- [x] Rounded snake body with head eyes
- [x] Responsive no-scroll layout
- [x] README with run instructions and controls
- [x] Contributor guide in `AGENTS.md`

## Planned Features

- [ ] Add online multiplayer rooms
- [ ] Add Python WebSocket server
- [ ] Support exactly two players per room
- [ ] Add room creation and join flow
- [ ] Add shared board with per-player scores
- [ ] Keep collisions limited to each player's own snake
- [ ] Add 2-minute match timer
- [ ] Determine winner by last alive or highest score at timeout
- [ ] Add multiplayer scoreboard and status UI
- [ ] Preserve existing single-player mode

See `MULTIPLAYER_PLAN.md` for the detailed implementation plan and task checklist.

## Known Notes

- Multiplayer should avoid the current random retry-only food placement approach and generate food from known empty cells.
- No framework is currently used; future additions should preserve simple browser execution unless the project scope changes.
