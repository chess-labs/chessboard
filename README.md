# Chess Core

A minimal, standalone chess logic implementation in TypeScript.

## Features

- Type-safe piece and board representations
- Pure logic with no UI or DOM dependencies
- Legal move calculation for all pieces
- Easily portable into any frontend or backend project
- Unit test friendly architecture
- Foundation for check, checkmate, castling, en passant, and promotion logic

## Installation

Once published to npm:

```bash
npm install @chess-labs/core
```

## Usage Example

```typescript
import { initBoard, getLegalMoves, movePiece } from '@chess-labs/core';

const board = initBoard();
const moves = getLegalMoves({ row: 6, col: 1 }, board); // Example: White pawn at b2

const newBoard = movePiece({ row: 6, col: 1 }, { row: 4, col: 1 }, board); // Move pawn to b4
```

## Architecture

```
src/
├── types.ts         # Core types (Piece, Board, Position)
├── board.ts         # Board initialization & utilities
├── board.spec.ts    # Board related tests
├── game.ts          # Game state, turn tracking, move execution
├── game.spec.ts     # Game logic tests
├── helper.ts        # Utility functions
├── helper.spec.ts   # Utility tests
└── moves/           # Per-piece movement logic
```

## Roadmap

- Basic movement rules
- Special rules (castling, en passant, promotion)
- Check & checkmate detection
- FEN/PGN support
- AI opponent (Stockfish)

## Testing

```bash
npm run test
```

Unit tests are written with Vitest, covering all movement and rule logic.

## Goals

- Write maintainable, testable TypeScript logic
- Decouple core engine from UI for maximum reusability
- Build as an open-source learning and portfolio project

## Contributing

Pull requests, suggestions, and feedback are welcome!
Please refer to the issues tab to get started.
