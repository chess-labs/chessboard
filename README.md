# Chess Core

A minimal, standalone chess logic implementation in TypeScript.

## Features

- 🎯 **Type-safe piece and board representations**
- 🔧 **Pure logic with no UI or DOM dependencies**
- ♟️ **Complete legal move calculation for all pieces**
- 🏰 **Full special rules support** (castling, en passant, promotion)
- ✅ **Check, checkmate, and stalemate detection**
- 📝 **FEN notation support** (import/export game states)
- 🔄 **Easily portable** into any frontend or backend project
- 🧪 **Unit test friendly architecture** with comprehensive test coverage

## Installation

Once published to npm:

```bash
npm install @chess-labs/core
```

## Usage Example

```typescript
import { initGameState, getLegalMoves, movePiece, gameStateToFen, fenToGameState } from '@chess-labs/core';

// Initialize a new game
const gameState = initGameState();

// Get legal moves for a piece
const moves = getLegalMoves({ row: 6, col: 4 }, gameState); // White pawn at e2

// Make a move
const newGameState = movePiece(
  { row: 6, col: 4 }, // from e2
  { row: 4, col: 4 }, // to e4
  gameState
);

// Convert to FEN notation
if (newGameState) {
  const fen = gameStateToFen(newGameState);
  console.log(fen); // "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"

  // Load from FEN
  const loadedGame = fenToGameState(fen);
}
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

- ✅ Basic movement rules
- ✅ Special rules (castling, en passant, promotion)
- ✅ Check & checkmate detection
- ✅ FEN support (NEW!)
- PGN support
- AI opponent integration examples

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
