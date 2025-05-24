// Main API exports for the chess engine

// Types
export type { Board, Position, Piece, Move, GameState, SpecialMove } from './types';

export { PieceType, Color } from './types';

// Board functions
export {
  initBoard,
  isValidPosition,
  getPieceAt,
  placePiece,
  removePiece,
  movePiece as movePieceOnBoard,
  clearPosition,
  clearBoard,
  isPathClear,
  algebraicToPosition,
  positionToAlgebraic,
  cloneBoard,
} from './board';

// Game functions
export {
  initGameState,
  movePiece,
  isValidMove,
  switchTurn,
  addMoveToHistory,
  getCurrentPlayer,
  getMoveHistory,
  isPlayerInCheck,
  isCheckmate,
  isStalemate,
  updateGameStatus,
} from './game';

// Move generation
export {
  getLegalMoves,
  getPawnMoves,
  getRookMoves,
  getKnightMoves,
  getBishopMoves,
  getQueenMoves,
  getKingMoves,
} from './moves';

// Helper utilities
export { arePositionsEqual } from './helper';
