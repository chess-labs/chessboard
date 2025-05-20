# Chess Core 

A minimal, standalone chess logic implementation in **TypeScript**.

---

## ✨ Features

- ♜ Fully type-safe piece and board representations
- ⚙️ Pure logic, no UI or DOM dependencies
- ♘ Legal move calculation for all pieces
- 📦 Easily portable into any frontend or backend project
- 🧪 Unit-test ready architecture
- 🧠 Foundation for check, checkmate, castling, en passant, and promotion logic

---

## 📦 Installation (Coming Soon)

Once published to npm:

```bash
npm install ...
```

---

## 🧰 Usage Example
```typescript
import { initBoard, getLegalMoves, movePiece } from 'ts-chess-engine';

const board = initBoard();
const moves = getLegalMoves({ x: 1, y: 1 }, board); // Example: White pawn at b2

const newBoard = movePiece({ x: 1, y: 1 }, { x: 1, y: 3 }, board); // Move pawn to b4
```

---

## 🏗️ Architecture Overview
```bash
src/
├── types.ts           # Core types (Piece, Board, Position)
├── board.ts           # Board initialization & utilities
├── moves/             # Per-piece movement logic
│   ├── pawn.ts
│   ├── rook.ts
│   ├── ...
├── game.ts            # Game state, turn tracking, move execution
├── index.ts           # Exported public API
└── __tests__/         # Unit tests
```

---

 ## 📚 Roadmap

- ✅ Basic movement rules
- 🔜 Special rules (castling, en passant, promotion)
- 🔜 Check & checkmate detection
- 🔜 FEN/PGN support
- 🔜 AI opponent (minimax / evaluation)

---

## 🧪 Testing
```bash
npm run test
```
Unit tests are written with Jest or Vitest, covering all movement and rule logic.

---

## 💡 Goals
- Write maintainable, testable TypeScript logic
- Decouple core engine from UI for maximum reusability
- Build as an open-source learning and portfolio project

---

## 🤝 Contributing
Pull requests, suggestions, and feedback are welcome!
Please refer to the issues tab to get started.

