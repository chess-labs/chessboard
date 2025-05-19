import { describe, it, expect } from 'vitest';
import { getRookMoves, isValidRookMove } from './rook';
import { initBoard } from '../board';
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
      board[0][0] = null;
      board[0][1] = null;
      board[0][2] = null;
      // Place a rook on an open space
      board[0][3] = { type: PieceType.ROOK, color: Color.BLACK };

      const gameState = createGameState(board);
      const moves = getRookMoves({ x: 3, y: 0 }, gameState);

      expect(moves).toContainEqual({
        from: { x: 3, y: 0 },
        to: { x: 0, y: 0 },
      });
      expect(moves).toContainEqual({
        from: { x: 3, y: 0 },
        to: { x: 1, y: 0 },
      });
      expect(moves).toContainEqual({
        from: { x: 3, y: 0 },
        to: { x: 2, y: 0 },
      });
    });

    it('should allow vertical moves', () => {
      const board = initBoard();
      // Clear pieces to make space
      for (let i = 0; i < 8; i++) {
        board[i][0] = null;
      }
      // Place a rook on an open space
      board[3][0] = { type: PieceType.ROOK, color: Color.BLACK };

      const gameState = createGameState(board);
      const moves = getRookMoves({ x: 0, y: 3 }, gameState);

      expect(moves).toContainEqual({
        from: { x: 0, y: 3 },
        to: { x: 0, y: 0 },
      });
      expect(moves).toContainEqual({
        from: { x: 0, y: 3 },
        to: { x: 0, y: 7 },
      });
    });

    it('should detect and stop at blocking pieces of the same color', () => {
      const board = initBoard();
      // Clear pieces to make space
      for (let i = 0; i < 8; i++) {
        board[7][i] = null;
      }
      // Place a rook and a blocking piece of the same color
      board[7][0] = { type: PieceType.ROOK, color: Color.WHITE };
      board[7][3] = { type: PieceType.PAWN, color: Color.WHITE };

      const gameState = createGameState(board);
      const moves = getRookMoves({ x: 0, y: 7 }, gameState);

      expect(moves).toContainEqual({
        from: { x: 0, y: 7 },
        to: { x: 1, y: 7 },
      });
      expect(moves).toContainEqual({
        from: { x: 0, y: 7 },
        to: { x: 2, y: 7 },
      });
      // Should not be able to move to or past the blocking piece
      expect(moves).not.toContainEqual({
        from: { x: 0, y: 7 },
        to: { x: 3, y: 7 },
      });
      expect(moves).not.toContainEqual({
        from: { x: 0, y: 7 },
        to: { x: 4, y: 7 },
      });
    });

    it('should allow capturing opponent pieces', () => {
      const board = initBoard();
      // Clear pieces to make space
      for (let i = 0; i < 8; i++) {
        board[7][i] = null;
      }
      // Place a rook and an opponent piece
      board[7][0] = { type: PieceType.ROOK, color: Color.WHITE };
      board[7][3] = { type: PieceType.PAWN, color: Color.BLACK };

      const gameState = createGameState(board);
      const moves = getRookMoves({ x: 0, y: 7 }, gameState);

      expect(moves).toContainEqual({
        from: { x: 0, y: 7 },
        to: { x: 3, y: 7 },
        capture: true,
      });
      // Should not be able to move past the captured piece
      expect(moves).not.toContainEqual({
        from: { x: 0, y: 7 },
        to: { x: 4, y: 7 },
      });
    });

    it('should not return moves for non-rook pieces', () => {
      const gameState = createGameState();
      const moves = getRookMoves({ x: 0, y: 1 }, gameState); // Pawn position
      expect(moves).toHaveLength(0);
    });
  });

  describe('isValidRookMove', () => {
    it('should return true for valid horizontal moves', () => {
      const board = initBoard();
      // Clear pieces to make space
      for (let i = 0; i < 8; i++) {
        board[7][i] = null;
      }
      // Place a rook
      board[7][0] = { type: PieceType.ROOK, color: Color.WHITE };

      const gameState = createGameState(board);
      expect(isValidRookMove({ x: 0, y: 7 }, { x: 4, y: 7 }, gameState)).toBe(true);
    });

    it('should return true for valid vertical moves', () => {
      const board = initBoard();
      // Clear pieces to make space
      for (let i = 0; i < 8; i++) {
        board[i][0] = null;
      }
      // Place a rook
      board[7][0] = { type: PieceType.ROOK, color: Color.WHITE };

      const gameState = createGameState(board);
      expect(isValidRookMove({ x: 0, y: 7 }, { x: 0, y: 3 }, gameState)).toBe(true);
    });

    it('should return false for diagonal moves', () => {
      const board = initBoard();
      // Clear pieces to make space
      for (let i = 0; i < 8; i++) {
        board[7][i] = null;
        board[i][0] = null;
      }
      // Place a rook
      board[7][0] = { type: PieceType.ROOK, color: Color.WHITE };

      const gameState = createGameState(board);
      expect(isValidRookMove({ x: 0, y: 7 }, { x: 3, y: 4 }, gameState)).toBe(false);
    });

    it('should return false for non-rook pieces', () => {
      const gameState = createGameState();
      expect(isValidRookMove({ x: 0, y: 1 }, { x: 0, y: 3 }, gameState)).toBe(false);
    });

    it('should return false if the path is blocked', () => {
      const board = initBoard();
      // No need to clear anything, the initial board has pawns blocking the rooks
      const gameState = createGameState(board);
      expect(isValidRookMove({ x: 0, y: 0 }, { x: 0, y: 3 }, gameState)).toBe(false);
    });
  });
});
