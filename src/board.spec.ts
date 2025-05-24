import { describe, it, expect } from 'vitest';
import {
  initBoard,
  isValidPosition,
  getPieceAt,
  isPathClear,
  algebraicToPosition,
  positionToAlgebraic,
  cloneBoard,
} from './board';
import { Color, PieceType } from './types';

describe('Board functions', () => {
  describe('initBoard', () => {
    it('should initialize an 8x8 chess board', () => {
      const board = initBoard();
      expect(board.length).toBe(8);

      for (let row = 0; row < 8; row++) {
        expect(board[row].length).toBe(8);
      }
    });

    it('should place pawns correctly', () => {
      const board = initBoard();

      // Black pawns in the row 1
      for (let row = 0; row < 8; row++) {
        expect(board[1][row]).toEqual({ type: PieceType.PAWN, color: Color.BLACK });
      }

      // White pawns in the row 6
      for (let row = 0; row < 8; row++) {
        expect(board[6][row]).toEqual({ type: PieceType.PAWN, color: Color.WHITE });
      }
    });

    it('should place rooks, knights, bishops, queens, and kings correctly', () => {
      const board = initBoard();

      // Black pieces (top row)
      expect(board[0][0]).toEqual({ type: PieceType.ROOK, color: Color.BLACK });
      expect(board[0][1]).toEqual({ type: PieceType.KNIGHT, color: Color.BLACK });
      expect(board[0][2]).toEqual({ type: PieceType.BISHOP, color: Color.BLACK });
      expect(board[0][3]).toEqual({ type: PieceType.QUEEN, color: Color.BLACK });
      expect(board[0][4]).toEqual({ type: PieceType.KING, color: Color.BLACK });
      expect(board[0][5]).toEqual({ type: PieceType.BISHOP, color: Color.BLACK });
      expect(board[0][6]).toEqual({ type: PieceType.KNIGHT, color: Color.BLACK });
      expect(board[0][7]).toEqual({ type: PieceType.ROOK, color: Color.BLACK });

      // White pieces (bottom row)
      expect(board[7][0]).toEqual({ type: PieceType.ROOK, color: Color.WHITE });
      expect(board[7][1]).toEqual({ type: PieceType.KNIGHT, color: Color.WHITE });
      expect(board[7][2]).toEqual({ type: PieceType.BISHOP, color: Color.WHITE });
      expect(board[7][3]).toEqual({ type: PieceType.QUEEN, color: Color.WHITE });
      expect(board[7][4]).toEqual({ type: PieceType.KING, color: Color.WHITE });
      expect(board[7][5]).toEqual({ type: PieceType.BISHOP, color: Color.WHITE });
      expect(board[7][6]).toEqual({ type: PieceType.KNIGHT, color: Color.WHITE });
      expect(board[7][7]).toEqual({ type: PieceType.ROOK, color: Color.WHITE });
    });
  });

  describe('isValidPosition', () => {
    it('should return true for valid positions', () => {
      expect(isValidPosition({ col: 0, row: 0 })).toBe(true);
      expect(isValidPosition({ col: 7, row: 7 })).toBe(true);
      expect(isValidPosition({ col: 3, row: 4 })).toBe(true);
    });

    it('should return false for invalid positions', () => {
      expect(isValidPosition({ col: -1, row: 0 })).toBe(false);
      expect(isValidPosition({ col: 0, row: -1 })).toBe(false);
      expect(isValidPosition({ col: 8, row: 0 })).toBe(false);
      expect(isValidPosition({ col: 0, row: 8 })).toBe(false);
    });
  });

  describe('getPieceAt', () => {
    it('should return the piece at a valid position', () => {
      const board = initBoard();
      // Black rook at position (0, 0)
      expect(getPieceAt({ col: 0, row: 0 }, board)).toEqual({ type: PieceType.ROOK, color: Color.BLACK });
      // White queen at position (3, 7)
      expect(getPieceAt({ col: 3, row: 7 }, board)).toEqual({ type: PieceType.QUEEN, color: Color.WHITE });
    });

    it('should return null for positions outside the board', () => {
      const board = initBoard();
      expect(getPieceAt({ col: -1, row: 0 }, board)).toBeNull();
      expect(getPieceAt({ col: 0, row: -1 }, board)).toBeNull();
      expect(getPieceAt({ col: 8, row: 0 }, board)).toBeNull();
      expect(getPieceAt({ col: 0, row: 8 }, board)).toBeNull();
    });

    it('should return null for empty positions', () => {
      const board = initBoard();
      // Empty square at position (3, 3)
      expect(getPieceAt({ col: 3, row: 3 }, board)).toBeNull();
    });

    it('should return null for invalid positions', () => {
      const board = initBoard();
      expect(getPieceAt({ col: -1, row: 0 }, board)).toBeNull();
      expect(getPieceAt({ col: 0, row: -1 }, board)).toBeNull();
      expect(getPieceAt({ col: 8, row: 0 }, board)).toBeNull();
      expect(getPieceAt({ col: 0, row: 8 }, board)).toBeNull();
    });
  });

  describe('isPathClear', () => {
    it('should return true if path is clear (horizontally)', () => {
      const board = initBoard();
      // Clear the board in the middle
      for (let row = 2; row <= 5; row++) {
        for (let col = 0; col < 8; col++) {
          board[row][col] = null;
        }
      }

      expect(isPathClear({ col: 1, row: 3 }, { col: 6, row: 3 }, board)).toBe(true);
    });

    it('should return true if path is clear (vertically)', () => {
      const board = initBoard();
      // Clear column 4
      for (let row = 2; row <= 5; row++) {
        board[row][4] = null;
      }

      expect(isPathClear({ col: 4, row: 2 }, { col: 4, row: 5 }, board)).toBe(true);
    });

    it('should return true if path is clear (diagonally)', () => {
      const board = initBoard();
      // Clear diagonals
      board[2][2] = null;
      board[3][3] = null;
      board[4][4] = null;
      board[5][5] = null;

      board[1][1] = { type: PieceType.PAWN, color: Color.BLACK };
      board[6][6] = { type: PieceType.PAWN, color: Color.WHITE };

      expect(isPathClear({ col: 1, row: 1 }, { col: 6, row: 6 }, board)).toBe(true);
      expect(isPathClear({ col: 2, row: 2 }, { col: 5, row: 5 }, board)).toBe(true);
    });

    it('should return false if path is not clear', () => {
      const board = initBoard();
      // Black pawns block the path
      expect(isPathClear({ col: 0, row: 0 }, { col: 0, row: 3 }, board)).toBe(false);
      // White pawns block the path
      expect(isPathClear({ col: 3, row: 7 }, { col: 3, row: 3 }, board)).toBe(false);
    });

    it('should return true for the same position', () => {
      const board = initBoard();
      expect(isPathClear({ col: 3, row: 3 }, { col: 3, row: 3 }, board)).toBe(true);
    });
  });

  describe('algebraicToPosition', () => {
    // TODO: Support for uppercase notation (e.g., 'A1', 'H8') needs to be implemented
    it('should convert algebraic notation to position correctly', () => {
      expect(algebraicToPosition('a1')).toEqual({ col: 0, row: 7 });
      expect(algebraicToPosition('h8')).toEqual({ col: 7, row: 0 });
      expect(algebraicToPosition('e4')).toEqual({ col: 4, row: 4 });
      expect(algebraicToPosition('c6')).toEqual({ col: 2, row: 2 });
    });
  });

  describe('positionToAlgebraic', () => {
    it('should convert position to algebraic notation correctly', () => {
      expect(positionToAlgebraic({ col: 0, row: 7 })).toBe('a1');
      expect(positionToAlgebraic({ col: 7, row: 0 })).toBe('h8');
      expect(positionToAlgebraic({ col: 4, row: 4 })).toBe('e4');
      expect(positionToAlgebraic({ col: 2, row: 2 })).toBe('c6');
    });
  });

  describe('algebraic and position conversions', () => {
    it('should be reversible', () => {
      const testPositions = [
        { col: 0, row: 0 },
        { col: 7, row: 7 },
        { col: 3, row: 2 },
        { col: 5, row: 6 },
      ];

      for (const position of testPositions) {
        const algebraic = positionToAlgebraic(position);
        const converted = algebraicToPosition(algebraic);
        expect(converted).toEqual(position);
      }

      const testAlgebraic = ['a1', 'h8', 'e4', 'b7'];

      for (const notation of testAlgebraic) {
        const position = algebraicToPosition(notation);
        const converted = positionToAlgebraic(position);
        expect(converted).toBe(notation);
      }
    });
  });

  describe('cloneBoard', () => {
    it('should create a deep copy of the board', () => {
      const originalBoard = initBoard();
      const clonedBoard = cloneBoard(originalBoard);

      // Should be equal but not the same reference
      expect(clonedBoard).toEqual(originalBoard);
      expect(clonedBoard).not.toBe(originalBoard);

      // Modifying the clone should not modify the original
      clonedBoard[0][0] = null;
      expect(originalBoard[0][0]).toEqual({ type: PieceType.ROOK, color: Color.BLACK });
    });
  });
});
