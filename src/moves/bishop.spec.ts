import { describe, it, expect } from 'vitest';
import { getBishopMoves, isValidBishopMove } from './bishop';
import { initBoard } from '../board';
import { Color, PieceType, type GameState } from '../types';

describe('Bishop moves', () => {
  const createGameState = (board = initBoard()): GameState => ({
    board,
    currentTurn: Color.WHITE,
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
  });

  describe('getBishopMoves', () => {
    it('should allow diagonal moves in all directions', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a bishop in the center of the board
      board[3][3] = { type: PieceType.BISHOP, color: Color.WHITE };

      const gameState = createGameState(board);
      const moves = getBishopMoves({ x: 3, y: 3 }, gameState);

      // Check diagonal moves in all directions
      // Upper-right diagonal
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 4, y: 2 },
        capture: false,
      });

      // Upper-left diagonal
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 2, y: 2 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 0, y: 0 },
        capture: false,
      });

      // Lower-right diagonal
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 4, y: 4 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 7, y: 7 },
        capture: false,
      });

      // Lower-left diagonal
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 2, y: 4 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 0, y: 6 },
        capture: false,
      });

      // Should have exactly 13 moves in total (all diagonals from center position)
      expect(moves.length).toBe(13);
    });

    it('should detect and stop at blocking pieces of the same color', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a bishop and a blocking piece of the same color
      board[3][3] = { type: PieceType.BISHOP, color: Color.WHITE };
      board[5][5] = { type: PieceType.PAWN, color: Color.WHITE };

      const gameState = createGameState(board);
      const moves = getBishopMoves({ x: 3, y: 3 }, gameState);

      // Should be able to move diagonally in the lower-right direction up to but not including the blocking piece
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 4, y: 4 },
        capture: false,
      });

      // Should not be able to move to or past the blocking piece
      expect(moves).not.toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 5, y: 5 },
        capture: false,
      });
      expect(moves).not.toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 6, y: 6 },
        capture: false,
      });
    });

    it('should allow capturing opponent pieces', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a bishop and an opponent piece
      board[3][3] = { type: PieceType.BISHOP, color: Color.WHITE };
      board[5][5] = { type: PieceType.PAWN, color: Color.BLACK };

      const gameState = createGameState(board);
      const moves = getBishopMoves({ x: 3, y: 3 }, gameState);

      // Should be able to capture the opponent piece
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 5, y: 5 },
        capture: true,
      });

      // Should not be able to move past the captured piece
      expect(moves).not.toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 6, y: 6 },
        capture: false,
      });
    });

    it('should not return moves for non-bishop pieces', () => {
      const gameState = createGameState();
      const moves = getBishopMoves({ x: 0, y: 1 }, gameState); // Pawn position
      expect(moves).toHaveLength(0);
    });

    it('should handle edge positions correctly', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a bishop at the edge
      board[0][0] = { type: PieceType.BISHOP, color: Color.WHITE };

      const gameState = createGameState(board);
      const moves = getBishopMoves({ x: 0, y: 0 }, gameState);

      // Only one diagonal direction is possible from the corner
      expect(moves).toContainEqual({
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { x: 0, y: 0 },
        to: { x: 7, y: 7 },
        capture: false,
      });

      // Should have 7 moves (the entire diagonal from corner to corner)
      expect(moves.length).toBe(7);
    });
  });

  describe('isValidBishopMove', () => {
    it('should return true for valid diagonal moves', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a bishop
      board[3][3] = { type: PieceType.BISHOP, color: Color.WHITE };

      const gameState = createGameState(board);

      // Valid diagonal moves
      expect(isValidBishopMove({ x: 3, y: 3 }, { x: 5, y: 5 }, gameState)).toBe(true);
      expect(isValidBishopMove({ x: 3, y: 3 }, { x: 0, y: 0 }, gameState)).toBe(true);
      expect(isValidBishopMove({ x: 3, y: 3 }, { x: 6, y: 0 }, gameState)).toBe(true);
      expect(isValidBishopMove({ x: 3, y: 3 }, { x: 0, y: 6 }, gameState)).toBe(true);
    });

    it('should return false for non-diagonal moves', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a bishop
      board[3][3] = { type: PieceType.BISHOP, color: Color.WHITE };

      const gameState = createGameState(board);

      // Horizontal and vertical moves are invalid for bishops
      expect(isValidBishopMove({ x: 3, y: 3 }, { x: 3, y: 5 }, gameState)).toBe(false);
      expect(isValidBishopMove({ x: 3, y: 3 }, { x: 6, y: 3 }, gameState)).toBe(false);

      // Non-diagonal moves
      expect(isValidBishopMove({ x: 3, y: 3 }, { x: 5, y: 6 }, gameState)).toBe(false);
    });

    it('should return false when path is blocked', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a bishop and a blocking piece
      board[3][3] = { type: PieceType.BISHOP, color: Color.WHITE };
      board[5][5] = { type: PieceType.PAWN, color: Color.WHITE };

      const gameState = createGameState(board);

      // Path is blocked by own piece
      expect(isValidBishopMove({ x: 3, y: 3 }, { x: 6, y: 6 }, gameState)).toBe(false);
    });

    it('should return true when capturing an opponent piece', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a bishop and an opponent piece
      board[3][3] = { type: PieceType.BISHOP, color: Color.WHITE };
      board[5][5] = { type: PieceType.PAWN, color: Color.BLACK };

      const gameState = createGameState(board);

      // Can capture opponent piece
      expect(isValidBishopMove({ x: 3, y: 3 }, { x: 5, y: 5 }, gameState)).toBe(true);

      // Cannot move past the opponent piece
      expect(isValidBishopMove({ x: 3, y: 3 }, { x: 6, y: 6 }, gameState)).toBe(false);
    });

    it('should return false for non-bishop pieces', () => {
      const gameState = createGameState();

      // Pawn position
      expect(isValidBishopMove({ x: 0, y: 1 }, { x: 2, y: 3 }, gameState)).toBe(false);
    });
  });
});
