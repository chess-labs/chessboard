import { describe, it, expect } from 'vitest';
import { getRookMoves, isValidRookMove } from './rook';
import { clearPosition, initBoard, placePiece } from '../board';
import { Color, PieceType, type GameState } from '../types';

describe('Rook moves', () => {
  const createGameState = (board = initBoard()): GameState => ({
    board,
    currentTurn: Color.WHITE,
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
  });

  describe('getRookMoves', () => {
    it('should allow horizontal moves', () => {
      const board = initBoard();
      // Clear pieces to make space
      clearPosition(board, { col: 0, row: 0 });
      clearPosition(board, { col: 1, row: 0 });
      clearPosition(board, { col: 2, row: 0 });
      // Place a rook on an open space
      placePiece(board, { col: 3, row: 0 }, { type: PieceType.ROOK, color: Color.BLACK });

      const gameState = createGameState(board);
      const moves = getRookMoves({ col: 3, row: 0 }, gameState);

      expect(moves).toContainEqual({
        from: { col: 3, row: 0 },
        to: { col: 0, row: 0 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { col: 3, row: 0 },
        to: { col: 1, row: 0 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { col: 3, row: 0 },
        to: { col: 2, row: 0 },
        capture: false,
      });
    });

    it('should allow vertical moves', () => {
      const board = initBoard();
      // Clear pieces to make space
      for (let row = 0; row < 8; row++) {
        clearPosition(board, { col: 0, row });
      }
      // Place a rook on an open space
      placePiece(board, { col: 0, row: 3 }, { type: PieceType.ROOK, color: Color.BLACK });

      const gameState = createGameState(board);
      const moves = getRookMoves({ col: 0, row: 3 }, gameState);

      expect(moves).toContainEqual({
        from: { col: 0, row: 3 },
        to: { col: 0, row: 0 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { col: 0, row: 3 },
        to: { col: 0, row: 7 },
        capture: false,
      });
    });

    it('should detect and stop at blocking pieces of the same color', () => {
      const board = initBoard();
      // Clear pieces to make space
      for (let col = 0; col < 8; col++) {
        clearPosition(board, { col, row: 7 });
      }
      // Place a rook and a blocking piece of the same color
      placePiece(board, { col: 0, row: 7 }, { type: PieceType.ROOK, color: Color.WHITE });
      placePiece(board, { col: 3, row: 7 }, { type: PieceType.PAWN, color: Color.WHITE });

      const gameState = createGameState(board);
      const moves = getRookMoves({ col: 0, row: 7 }, gameState);

      expect(moves).toContainEqual({
        from: { col: 0, row: 7 },
        to: { col: 1, row: 7 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { col: 0, row: 7 },
        to: { col: 2, row: 7 },
        capture: false,
      });
      // Should not be able to move to or past the blocking piece
      expect(moves).not.toContainEqual({
        from: { col: 0, row: 7 },
        to: { col: 3, row: 7 },
        capture: false,
      });
      expect(moves).not.toContainEqual({
        from: { col: 0, row: 7 },
        to: { col: 4, row: 7 },
        capture: false,
      });
    });

    it('should allow capturing opponent pieces', () => {
      const board = initBoard();
      // Clear pieces to make space
      for (let col = 0; col < 8; col++) {
        clearPosition(board, { col, row: 7 });
      }
      // Place a rook and an opponent piece
      placePiece(board, { col: 0, row: 7 }, { type: PieceType.ROOK, color: Color.WHITE });
      placePiece(board, { col: 3, row: 7 }, { type: PieceType.PAWN, color: Color.BLACK });

      const gameState = createGameState(board);
      const moves = getRookMoves({ col: 0, row: 7 }, gameState);

      expect(moves).toContainEqual({
        from: { col: 0, row: 7 },
        to: { col: 3, row: 7 },
        capture: true,
      });
      // Should not be able to move past the captured piece
      expect(moves).not.toContainEqual({
        from: { col: 0, row: 7 },
        to: { col: 4, row: 7 },
      });
    });

    it('should not return moves for non-rook pieces', () => {
      const gameState = createGameState();
      const moves = getRookMoves({ col: 0, row: 1 }, gameState); // Pawn position
      expect(moves).toHaveLength(0);
    });
  });

  describe('isValidRookMove', () => {
    it('should return true for valid horizontal moves', () => {
      const board = initBoard();
      // Clear pieces to make space
      for (let col = 0; col < 8; col++) {
        clearPosition(board, { col, row: 7 });
      }
      // Place a rook
      placePiece(board, { col: 0, row: 7 }, { type: PieceType.ROOK, color: Color.WHITE });

      const gameState = createGameState(board);
      expect(isValidRookMove({ col: 0, row: 7 }, { col: 4, row: 7 }, gameState)).toBe(true);
    });

    it('should return true for valid vertical moves', () => {
      const board = initBoard();
      // Clear pieces to make space
      for (let row = 0; row < 8; row++) {
        clearPosition(board, { col: 0, row });
      }
      // Place a rook
      placePiece(board, { col: 0, row: 7 }, { type: PieceType.ROOK, color: Color.WHITE });

      const gameState = createGameState(board);
      expect(isValidRookMove({ col: 0, row: 7 }, { col: 0, row: 3 }, gameState)).toBe(true);
    });

    it('should return false for diagonal moves', () => {
      const board = initBoard();
      // Clear pieces to make space
      for (let col = 0; col < 8; col++) {
        clearPosition(board, { col, row: 7 });
      }
      for (let row = 0; row < 8; row++) {
        clearPosition(board, { col: 0, row });
      }
      // Place a rook
      placePiece(board, { col: 0, row: 7 }, { type: PieceType.ROOK, color: Color.WHITE });

      const gameState = createGameState(board);
      expect(isValidRookMove({ col: 0, row: 7 }, { col: 3, row: 4 }, gameState)).toBe(false);
    });

    it('should return false for non-rook pieces', () => {
      const gameState = createGameState();
      expect(isValidRookMove({ col: 0, row: 1 }, { col: 0, row: 3 }, gameState)).toBe(false);
    });

    it('should return false if the path is blocked', () => {
      const board = initBoard();
      // No need to clear anything, the initial board has pawns blocking the rooks
      const gameState = createGameState(board);
      expect(isValidRookMove({ col: 0, row: 0 }, { col: 0, row: 3 }, gameState)).toBe(false);
    });
  });
});
