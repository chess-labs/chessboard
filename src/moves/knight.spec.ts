import { describe, it, expect } from 'vitest';
import { getKnightMoves, isValidKnightMove } from './knight';
import { clearPosition, initBoard, placePiece } from '../board';
import { Color, PieceType, type Position, type GameState } from '../types';

describe('Knight moves', () => {
  const createGameState = (board = initBoard()): GameState => ({
    board,
    currentTurn: Color.WHITE,
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
  });

  describe('getKnightMoves', () => {
    it('should have 8 possible moves when knight is in the center', () => {
      const position: Position = { col: 3, row: 3 };
      const moves = getKnightMoves(position);

      // Check all 8 possible L-shaped moves
      expect(moves).toContainEqual({ col: 1, row: 2 });
      expect(moves).toContainEqual({ col: 1, row: 4 });
      expect(moves).toContainEqual({ col: 2, row: 1 });
      expect(moves).toContainEqual({ col: 2, row: 5 });
      expect(moves).toContainEqual({ col: 4, row: 1 });
      expect(moves).toContainEqual({ col: 4, row: 5 });
      expect(moves).toContainEqual({ col: 5, row: 2 });
      expect(moves).toContainEqual({ col: 5, row: 4 });

      // Should have exactly 8 moves
      expect(moves).toHaveLength(8);
    });

    it('should have fewer possible moves when knight is at the edge', () => {
      const position: Position = { col: 0, row: 0 };
      const moves = getKnightMoves(position);

      // Knight at the edge has fewer valid moves
      expect(moves).toContainEqual({ col: 1, row: 2 });
      expect(moves).toContainEqual({ col: 2, row: 1 });

      // Should have exactly 2 moves
      expect(moves).toHaveLength(2);
    });

    it('should have fewer possible moves when knight is at the corner', () => {
      const position: Position = { col: 7, row: 7 };
      const moves = getKnightMoves(position);

      // Knight at the corner has fewer valid moves
      expect(moves).toContainEqual({ col: 5, row: 6 });
      expect(moves).toContainEqual({ col: 6, row: 5 });

      // Should have exactly 2 moves
      expect(moves).toHaveLength(2);
    });

    it('should be able to jump over other pieces', () => {
      // Initialize a board with pieces
      const board = initBoard();

      // Knight position (original knight position)
      const position: Position = { col: 1, row: 0 };

      // Knight's possible moves
      const moves = getKnightMoves(position);

      // Knight should be able to jump over pawns in front
      expect(moves).toContainEqual({ col: 0, row: 2 });
      expect(moves).toContainEqual({ col: 2, row: 2 });
      expect(moves).toContainEqual({ col: 3, row: 1 });

      // These moves should not be included as they are outside the board
      expect(moves).not.toContainEqual({ col: -1, row: 1 });
      expect(moves).not.toContainEqual({ col: -1, row: -1 });

      // Should have exactly 3 moves
      expect(moves).toHaveLength(3);
    });

    it('should only include moves within valid x, y coordinates', () => {
      const position: Position = { col: 1, row: 1 };
      const moves = getKnightMoves(position);

      // Should only include valid moves
      expect(moves).toContainEqual({ col: 0, row: 3 });
      expect(moves).toContainEqual({ col: 2, row: 3 });
      expect(moves).toContainEqual({ col: 3, row: 0 });
      expect(moves).toContainEqual({ col: 3, row: 2 });

      // Moves outside the board should not be included
      expect(moves).not.toContainEqual({ col: -1, row: 0 });
      expect(moves).not.toContainEqual({ col: -1, row: 2 });
      expect(moves).not.toContainEqual({ col: 0, row: -1 });

      // Should have exactly 4 moves
      expect(moves).toHaveLength(4);
    });
  });

  describe('isValidKnightMove', () => {
    it('should return true for valid L-shaped moves', () => {
      const board = initBoard();
      // Clear some spaces
      for (let row = 2; row < 6; ++row) {
        for (let col = 2; col < 6; ++col) {
          clearPosition(board, { col, row });
        }
      }
      // Place a knight
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.KNIGHT, color: Color.WHITE });

      const gameState = createGameState(board);

      // Test all 8 valid knight moves
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 1, row: 2 }, gameState)).toBe(true);
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 1, row: 4 }, gameState)).toBe(true);
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 2, row: 1 }, gameState)).toBe(true);
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 2, row: 5 }, gameState)).toBe(true);
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 4, row: 1 }, gameState)).toBe(true);
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 4, row: 5 }, gameState)).toBe(true);
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 5, row: 2 }, gameState)).toBe(true);
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 5, row: 4 }, gameState)).toBe(true);
    });

    it('should return false for non-L-shaped moves', () => {
      const board = initBoard();
      // Clear some spaces
      for (let row = 2; row < 6; ++row) {
        for (let col = 2; col < 6; ++col) {
          clearPosition(board, { col, row });
        }
      }
      // Place a knight
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.KNIGHT, color: Color.WHITE });

      const gameState = createGameState(board);

      // Horizontal, vertical, and diagonal moves are invalid for knights
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 3, row: 4 }, gameState)).toBe(false);
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 4, row: 3 }, gameState)).toBe(false);
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 4, row: 4 }, gameState)).toBe(false);
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 5, row: 5 }, gameState)).toBe(false);
    });

    it('should return false when trying to capture own piece', () => {
      const board = initBoard();
      // Clear some spaces
      for (let row = 2; row < 6; ++row) {
        for (let col = 2; col < 6; ++col) {
          clearPosition(board, { col, row });
        }
      }
      // Place a knight and a piece of the same color at a knight's move away
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.KNIGHT, color: Color.WHITE });
      placePiece(board, { col: 4, row: 5 }, { type: PieceType.PAWN, color: Color.WHITE });

      const gameState = createGameState(board);

      // Cannot capture own piece
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 4, row: 5 }, gameState)).toBe(false);
    });

    it('should return true when capturing an opponent piece', () => {
      const board = initBoard();
      // Clear some spaces
      for (let row = 2; row < 6; ++row) {
        for (let col = 2; col < 6; ++col) {
          clearPosition(board, { col, row });
        }
      }
      // Place a knight and an opponent piece at a knight's move away
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.KNIGHT, color: Color.WHITE });
      placePiece(board, { col: 4, row: 5 }, { type: PieceType.PAWN, color: Color.BLACK });

      const gameState = createGameState(board);

      // Can capture opponent piece
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 5, row: 4 }, gameState)).toBe(true);
    });

    it('should return false when source position does not have a knight', () => {
      const board = initBoard();
      // Clear some spaces
      for (let row = 2; row < 6; ++row) {
        for (let col = 2; col < 6; ++col) {
          clearPosition(board, { col, row });
        }
      }
      // Place a pawn instead of a knight
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.PAWN, color: Color.WHITE });

      const gameState = createGameState(board);

      // Non-knight cannot make knight moves
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 5, row: 4 }, gameState)).toBe(false);
    });

    it('should return false for empty source position', () => {
      const board = initBoard();
      // Clear some spaces
      for (let row = 2; row < 6; ++row) {
        for (let col = 2; col < 6; ++col) {
          clearPosition(board, { col, row });
        }
      }

      const gameState = createGameState(board);

      // Empty square cannot make moves
      expect(isValidKnightMove({ col: 3, row: 3 }, { col: 5, row: 4 }, gameState)).toBe(false);
    });
  });
});
