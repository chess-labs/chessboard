import { describe, it, expect } from 'vitest';
import { getKingMoves, isValidKingMove } from './king';
import { clearPosition, initBoard } from '../board';
import { Color, PieceType } from '../types';
import type { GameState } from '../types';

describe('King moves', () => {
  const createGameState = (board = initBoard()): GameState => ({
    board,
    currentTurn: Color.WHITE,
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
  });

  describe('getKingMoves', () => {
    it('should return all valid one-square moves in open space', () => {
      const board = initBoard();
      // Clear the board
      for (let row = 0; row < 8; ++row) {
        for (let col = 0; col < 8; ++col) {
          clearPosition(board, { col, row });
        }
      }
      // Place king in the center
      const kingCol = 4;
      const kingRow = 4;
      board[kingRow][kingCol] = { type: PieceType.KING, color: Color.WHITE };

      const gameState = createGameState(board);
      const moves = getKingMoves({ col: kingCol, row: kingRow }, gameState);

      // King should be able to move one square in all 8 directions (total 8 moves)
      expect(moves).toHaveLength(8);

      // Check all directions
      expect(moves).toContainEqual({
        from: { col: kingCol, row: kingRow },
        to: { col: kingCol - 1, row: kingRow - 1 }, // top-left
      });
      expect(moves).toContainEqual({
        from: { col: kingCol, row: kingRow },
        to: { col: kingCol, row: kingRow - 1 }, // top
      });
      expect(moves).toContainEqual({
        from: { col: kingCol, row: kingRow },
        to: { col: kingCol + 1, row: kingRow - 1 }, // top-right
      });
      expect(moves).toContainEqual({
        from: { col: kingCol, row: kingRow },
        to: { col: kingCol - 1, row: kingRow }, // left
      });
      expect(moves).toContainEqual({
        from: { col: kingCol, row: kingRow },
        to: { col: kingCol + 1, row: kingRow }, // right
      });
      expect(moves).toContainEqual({
        from: { col: kingCol, row: kingRow },
        to: { col: kingCol - 1, row: kingRow + 1 }, // bottom-left
      });
      expect(moves).toContainEqual({
        from: { col: kingCol, row: kingRow },
        to: { col: kingCol, row: kingRow + 1 }, // bottom
      });
      expect(moves).toContainEqual({
        from: { col: kingCol, row: kingRow },
        to: { col: kingCol + 1, row: kingRow + 1 }, // bottom-right
      });
    });

    it('should respect board boundaries', () => {
      const board = initBoard();
      // Clear the board
      for (let row = 0; row < 8; ++row) {
        for (let col = 0; col < 8; ++col) {
          clearPosition(board, { col, row });
        }
      }
      // Place king in the corner
      board[0][0] = { type: PieceType.KING, color: Color.WHITE };

      const gameState = createGameState(board);
      const moves = getKingMoves({ col: 0, row: 0 }, gameState);

      // A king in the corner can only move in 3 directions (right, bottom, bottom-right)
      expect(moves).toHaveLength(3);

      expect(moves).toContainEqual({
        from: { col: 0, row: 0 },
        to: { col: 1, row: 0 }, // right
      });
      expect(moves).toContainEqual({
        from: { col: 0, row: 0 },
        to: { col: 0, row: 1 }, // bottom
      });
      expect(moves).toContainEqual({
        from: { col: 0, row: 0 },
        to: { col: 1, row: 1 }, // bottom-right
      });
    });

    it('should allow capturing opponent pieces', () => {
      const board = initBoard();
      // Clear the board
      for (let row = 0; row < 8; ++row) {
        for (let col = 0; col < 8; ++col) {
          clearPosition(board, { col, row });
        }
      }
      // Place king
      board[4][4] = { type: PieceType.KING, color: Color.WHITE };
      // Place an opponent piece
      board[4][5] = { type: PieceType.PAWN, color: Color.BLACK };

      const gameState = createGameState(board);
      const moves = getKingMoves({ col: 4, row: 4 }, gameState);

      // Check if capturing the opponent piece is included
      expect(moves).toContainEqual({
        from: { col: 4, row: 4 },
        to: { col: 5, row: 4 },
        capture: true,
      });
    });

    it('should not allow moving to squares occupied by the same color pieces', () => {
      const board = initBoard();
      // Clear the board
      for (let row = 0; row < 8; ++row) {
        for (let col = 0; col < 8; ++col) {
          clearPosition(board, { col, row });
        }
      }
      // Place king
      board[4][4] = { type: PieceType.KING, color: Color.WHITE };
      // Place a piece of the same color
      board[4][5] = { type: PieceType.PAWN, color: Color.WHITE };

      const gameState = createGameState(board);
      const moves = getKingMoves({ col: 4, row: 4 }, gameState);

      // Check that the move to a square with a piece of the same color is not allowed
      expect(moves).not.toContainEqual({
        from: { col: 4, row: 4 },
        to: { col: 5, row: 4 },
      });
    });

    it('should not return moves for non-king pieces', () => {
      const gameState = createGameState();
      const moves = getKingMoves({ col: 0, row: 1 }, gameState); // Pawn position
      expect(moves).toHaveLength(0);
    });
  });

  describe('isValidKingMove', () => {
    it('should return true for valid one-square moves', () => {
      const board = initBoard();
      // Clear the board
      for (let row = 0; row < 8; ++row) {
        for (let col = 0; col < 8; ++col) {
          clearPosition(board, { col, row });
        }
      }
      // Place king
      board[4][4] = { type: PieceType.KING, color: Color.WHITE };

      const gameState = createGameState(board);

      // Check all 8 directions
      expect(isValidKingMove({ col: 4, row: 4 }, { col: 3, row: 3 }, gameState)).toBe(true); // top-left
      expect(isValidKingMove({ col: 4, row: 4 }, { col: 4, row: 3 }, gameState)).toBe(true); // top
      expect(isValidKingMove({ col: 4, row: 4 }, { col: 5, row: 3 }, gameState)).toBe(true); // top-right
      expect(isValidKingMove({ col: 4, row: 4 }, { col: 3, row: 4 }, gameState)).toBe(true); // left
      expect(isValidKingMove({ col: 4, row: 4 }, { col: 5, row: 4 }, gameState)).toBe(true); // right
      expect(isValidKingMove({ col: 4, row: 4 }, { col: 3, row: 5 }, gameState)).toBe(true); // bottom-left
      expect(isValidKingMove({ col: 4, row: 4 }, { col: 4, row: 5 }, gameState)).toBe(true); // bottom
      expect(isValidKingMove({ col: 4, row: 4 }, { col: 5, row: 5 }, gameState)).toBe(true); // bottom-right
    });

    it('should return false for moves greater than one square', () => {
      const board = initBoard();
      // Clear the board
      for (let row = 0; row < 8; ++row) {
        for (let col = 0; col < 8; ++col) {
          clearPosition(board, { col, row });
        }
      }
      // Place king
      board[4][4] = { type: PieceType.KING, color: Color.WHITE };

      const gameState = createGameState(board);

      // Moves more than one square should not be possible
      expect(isValidKingMove({ col: 4, row: 4 }, { col: 4, row: 2 }, gameState)).toBe(false); // Two squares up
      expect(isValidKingMove({ col: 4, row: 4 }, { col: 6, row: 4 }, gameState)).toBe(false); // Two squares right
      expect(isValidKingMove({ col: 4, row: 4 }, { col: 6, row: 6 }, gameState)).toBe(false); // Two squares diagonally
    });

    it('should return false for non-king pieces', () => {
      const gameState = createGameState();
      expect(isValidKingMove({ col: 0, row: 1 }, { col: 0, row: 2 }, gameState)).toBe(false); // Pawn position
    });

    it('should return false when trying to move to a square occupied by the same color piece', () => {
      const board = initBoard();
      // Clear the board
      for (let row = 0; row < 8; ++row) {
        for (let col = 0; col < 8; ++col) {
          clearPosition(board, { col, row });
        }
      }
      // Place king
      board[4][4] = { type: PieceType.KING, color: Color.WHITE };
      // Place a piece of the same color
      board[4][5] = { type: PieceType.PAWN, color: Color.WHITE };

      const gameState = createGameState(board);

      expect(isValidKingMove({ col: 4, row: 4 }, { col: 5, row: 4 }, gameState)).toBe(false);
    });
  });
});
