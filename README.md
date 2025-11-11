# Pipe Mania

A browser-based puzzle game inspired by the classic "Pipe Mania - ZX Spectrum" where players must connect pipes to guide flowing water from a start point until the required length is achieved.

## Playing the Game

There's a build deployed to github-pages so the game can be played directly on the browser:
https://dezlezz.github.io/pipe-mania/

## Overview

This is a fully functional HTML5 puzzle game built with React, TypeScript, and Phaser 3. The game features a complete gameplay loop with water flow mechanics, pipe placement, and win/lose conditions.

## Technologies

- **React** - UI framework
- **TypeScript** - Type safety
- **Phaser 3** - Game engine
- **Vite** - Build tool and dev server
- **SCSS** - Styling

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Development

To run the game in development mode:

```bash
npm run dev
```

The game will be available at `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
```

The build output will be in the `dist` folder. This is a complete HTML5 bundle that can be hosted on any static web server.

### Running the Production Build

You can preview the production build locally using:

```bash
npm run preview
```

## Project Structure

```
pipe-mania/
├── src/
│   ├── components/          # React components
│   ├── game/
│   │   ├── managers/        # Game logic managers
│   │   ├── scenes/          # Phaser scenes
│   │   ├── types/           # TypeScript type definitions
│   │   └── *.tsx            # Game pieces and utilities
│   ├── styles/              # SCSS stylesheets
│   ├── App.tsx              # Main React app
│   └── main.tsx             # Entry point
├── public/
│   ├── assets/              # Game assets
│   └── config/
│       └── gameConfig.json  # Game configuration
└── dist/                    # Production build output
```

## Game Mechanics

### Grid

- Customizable 9x7 cell grid
- Some cells are randomly blocked and cannot hold pipes
- Start point is randomly chosen (cannot be on the last row)

### Pipe Pieces

- **Straight pipes**
- **Curved pipes**
- **Cross pipes**
- Pipes appear with random rotations, but cannot be rotated by the player
- Unlimited supply of pipes, displayed in a side queue

### Gameplay

- Mouse control
- Click on a cell to place a pipe
- Placing a new pipe replaces any existing piece if it has no water
- After a delay, water begins to flow from the start cell
- Each pipe segment fills in sequence to simulate flow
- Water flow follows the longest valid connected path
- Players can continue placing pipes while water flows

### Win/Lose Conditions

- **Win**: Create a continuous path that meets the minimum required length before water reaches a dead-end
- **Lose**: Water reaches a dead-end without completing the minimum required path length

## Configuration

Game parameters can be adjusted in `public/config/gameConfig.json`:

- Grid size (rows, cols, cellSize)
- Flow speed (startDelay, segmentDelay, pipePlacementDelay)
- Required path length (minRequiredLength, maxRequiredLength)
- Blocked cells count (minBlockedCells, maxBlockedCells)
- Available pipe types
