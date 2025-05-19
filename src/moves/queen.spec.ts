import { describe, it, expect } from 'vitest';
import { getQueenMoves, isValidQueenMove } from './queen';
import { initBoard } from '../board';
import { Color, PieceType, type GameState } from '../types';

describe('Queen moves', () => {
  const createGameState = (board = initBoard()): GameState => ({
    board,
    currentTurn: Color.WHITE,
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
  });

  describe('getQueenMoves', () => {
    it('should allow horizontal moves like a rook', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a queen in the center of the board
      board[3][3] = { type: PieceType.QUEEN, color: Color.WHITE };

      const gameState = createGameState(board);
      const moves = getQueenMoves({ x: 3, y: 3 }, gameState);

      // Check horizontal moves
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 0, y: 3 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 7, y: 3 },
        capture: false,
      });
    });

    it('should allow vertical moves like a rook', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a queen in the center of the board
      board[3][3] = { type: PieceType.QUEEN, color: Color.WHITE };

      const gameState = createGameState(board);
      const moves = getQueenMoves({ x: 3, y: 3 }, gameState);

      // Check vertical moves
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 3, y: 0 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 3, y: 7 },
        capture: false,
      });
    });

    it('should allow diagonal moves like a bishop', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a queen in the center of the board
      board[3][3] = { type: PieceType.QUEEN, color: Color.WHITE };

      const gameState = createGameState(board);
      const moves = getQueenMoves({ x: 3, y: 3 }, gameState);

      // Check diagonal moves
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 0, y: 0 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 6, y: 0 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 0, y: 6 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 6, y: 6 },
        capture: false,
      });
    });

    it('should detect and stop at blocking pieces of the same color', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a queen and blocking pieces of the same color
      board[3][3] = { type: PieceType.QUEEN, color: Color.WHITE };
      board[3][5] = { type: PieceType.PAWN, color: Color.WHITE }; // vertical block
      board[5][3] = { type: PieceType.PAWN, color: Color.WHITE }; // horizontal block
      board[5][5] = { type: PieceType.PAWN, color: Color.WHITE }; // diagonal block

      const gameState = createGameState(board);
      const moves = getQueenMoves({ x: 3, y: 3 }, gameState);

      // Should be able to move vertically up to but not including the blocking piece
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 3, y: 4 },
        capture: false,
      });

      // Should not be able to move to or past the blocking piece (vertical)
      expect(moves).not.toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 3, y: 5 },
        capture: false,
      });
      expect(moves).not.toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 3, y: 6 },
        capture: false,
      });

      // Should not be able to move to or past the blocking piece (horizontal)
      expect(moves).not.toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 5, y: 3 },
        capture: false,
      });
      expect(moves).not.toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 6, y: 3 },
        capture: false,
      });

      // Should not be able to move to or past the blocking piece (diagonal)
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
      // Place a queen and opponent pieces
      board[3][3] = { type: PieceType.QUEEN, color: Color.WHITE };
      board[3][5] = { type: PieceType.PAWN, color: Color.BLACK }; // vertical
      board[5][3] = { type: PieceType.PAWN, color: Color.BLACK }; // horizontal
      board[5][5] = { type: PieceType.PAWN, color: Color.BLACK }; // diagonal

      const gameState = createGameState(board);
      const moves = getQueenMoves({ x: 3, y: 3 }, gameState);

      // Should be able to capture the opponent piece (vertical)
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 3, y: 5 },
        capture: true,
      });

      // Should not be able to move past the captured piece (vertical)
      expect(moves).not.toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 3, y: 6 },
        capture: false,
      });

      // Should be able to capture the opponent piece (horizontal)
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 5, y: 3 },
        capture: true,
      });

      // Should not be able to move past the captured piece (horizontal)
      expect(moves).not.toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 6, y: 3 },
        capture: false,
      });

      // Should be able to capture the opponent piece (diagonal)
      expect(moves).toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 5, y: 5 },
        capture: true,
      });

      // Should not be able to move past the captured piece (diagonal)
      expect(moves).not.toContainEqual({
        from: { x: 3, y: 3 },
        to: { x: 6, y: 6 },
        capture: false,
      });
    });

    it('should not return moves for non-queen pieces', () => {
      const gameState = createGameState();
      const moves = getQueenMoves({ x: 0, y: 1 }, gameState); // Pawn position
      expect(moves).toHaveLength(0);
    });
  });

  describe('isValidQueenMove', () => {
    it('should return true for valid horizontal, vertical, and diagonal moves', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a queen
      board[3][3] = { type: PieceType.QUEEN, color: Color.WHITE };

      const gameState = createGameState(board);

      // Valid horizontal moves
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 0, y: 3 }, gameState)).toBe(true);
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 7, y: 3 }, gameState)).toBe(true);

      // Valid vertical moves
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 3, y: 0 }, gameState)).toBe(true);
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 3, y: 7 }, gameState)).toBe(true);

      // Valid diagonal moves
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 0, y: 0 }, gameState)).toBe(true);
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 6, y: 0 }, gameState)).toBe(true);
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 0, y: 6 }, gameState)).toBe(true);
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 6, y: 6 }, gameState)).toBe(true);
    });

    it('should return false for non-queen moves', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a queen
      board[3][3] = { type: PieceType.QUEEN, color: Color.WHITE };

      const gameState = createGameState(board);

      // Knight-like moves are invalid for queens
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 5, y: 4 }, gameState)).toBe(false);
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 1, y: 2 }, gameState)).toBe(false);
    });

    it('should return false when path is blocked', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a queen and a blocking piece
      board[3][3] = { type: PieceType.QUEEN, color: Color.WHITE };
      board[3][5] = { type: PieceType.PAWN, color: Color.WHITE }; // vertical block
      board[5][3] = { type: PieceType.PAWN, color: Color.WHITE }; // horizontal block
      board[5][5] = { type: PieceType.PAWN, color: Color.WHITE }; // diagonal block

      const gameState = createGameState(board);

      // Path is blocked by own pieces
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 3, y: 7 }, gameState)).toBe(false);
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 7, y: 3 }, gameState)).toBe(false);
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 7, y: 7 }, gameState)).toBe(false);
    });

    it('should return true when capturing an opponent piece', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          board[i][j] = null;
        }
      }
      // Place a queen and an opponent piece
      board[3][3] = { type: PieceType.QUEEN, color: Color.WHITE };
      board[3][5] = { type: PieceType.PAWN, color: Color.BLACK };

      const gameState = createGameState(board);

      // Can capture opponent piece
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 3, y: 5 }, gameState)).toBe(true);

      // Cannot move past the opponent piece
      expect(isValidQueenMove({ x: 3, y: 3 }, { x: 3, y: 6 }, gameState)).toBe(false);
    });

    it('should return false for non-queen pieces', () => {
      const gameState = createGameState();

      // Pawn position
      expect(isValidQueenMove({ x: 0, y: 1 }, { x: 0, y: 3 }, gameState)).toBe(false);
    });
  });
});
