import { describe, it, expect } from 'vitest';
import { initBoard, isValidPosition, getPieceAt, isPathClear, algebraicToPosition, positionToAlgebraic } from './board';
import { Color, PieceType } from './types';

describe('Board functions', () => {
  describe('initBoard', () => {
    it('should create an 8x8 board', () => {
      const board = initBoard();
      expect(board.length).toBe(8);
      expect(board[0].length).toBe(8);
      expect(board[7].length).toBe(8);
    });

    it('should place pawns correctly', () => {
      const board = initBoard();
      // Check black pawns on row 1
      for (let i = 0; i < 8; i++) {
        expect(board[1][i]).toEqual({ type: PieceType.PAWN, color: Color.BLACK });
      }
      // Check white pawns on row 6
      for (let i = 0; i < 8; i++) {
        expect(board[6][i]).toEqual({ type: PieceType.PAWN, color: Color.WHITE });
      }
    });

    it('should place rooks correctly', () => {
      const board = initBoard();
      expect(board[0][0]).toEqual({ type: PieceType.ROOK, color: Color.BLACK });
      expect(board[0][7]).toEqual({ type: PieceType.ROOK, color: Color.BLACK });
      expect(board[7][0]).toEqual({ type: PieceType.ROOK, color: Color.WHITE });
      expect(board[7][7]).toEqual({ type: PieceType.ROOK, color: Color.WHITE });
    });

    it('should place knights correctly', () => {
      const board = initBoard();
      expect(board[0][1]).toEqual({ type: PieceType.KNIGHT, color: Color.BLACK });
      expect(board[0][6]).toEqual({ type: PieceType.KNIGHT, color: Color.BLACK });
      expect(board[7][1]).toEqual({ type: PieceType.KNIGHT, color: Color.WHITE });
      expect(board[7][6]).toEqual({ type: PieceType.KNIGHT, color: Color.WHITE });
    });

    it('should place bishops correctly', () => {
      const board = initBoard();
      expect(board[0][2]).toEqual({ type: PieceType.BISHOP, color: Color.BLACK });
      expect(board[0][5]).toEqual({ type: PieceType.BISHOP, color: Color.BLACK });
      expect(board[7][2]).toEqual({ type: PieceType.BISHOP, color: Color.WHITE });
      expect(board[7][5]).toEqual({ type: PieceType.BISHOP, color: Color.WHITE });
    });

    it('should place queens correctly', () => {
      const board = initBoard();
      expect(board[0][3]).toEqual({ type: PieceType.QUEEN, color: Color.BLACK });
      expect(board[7][3]).toEqual({ type: PieceType.QUEEN, color: Color.WHITE });
    });

    it('should place kings correctly', () => {
      const board = initBoard();
      expect(board[0][4]).toEqual({ type: PieceType.KING, color: Color.BLACK });
      expect(board[7][4]).toEqual({ type: PieceType.KING, color: Color.WHITE });
    });

    it('should have empty squares in the middle rows', () => {
      const board = initBoard();
      for (let row = 2; row <= 5; row++) {
        for (let col = 0; col < 8; col++) {
          expect(board[row][col]).toBeNull();
        }
      }
    });
  });

  describe('isValidPosition', () => {
    it('should return true for valid positions', () => {
      expect(isValidPosition({ x: 0, y: 0 })).toBe(true);
      expect(isValidPosition({ x: 7, y: 7 })).toBe(true);
      expect(isValidPosition({ x: 3, y: 4 })).toBe(true);
    });

    it('should return false for invalid positions', () => {
      expect(isValidPosition({ x: -1, y: 0 })).toBe(false);
      expect(isValidPosition({ x: 0, y: -1 })).toBe(false);
      expect(isValidPosition({ x: 8, y: 0 })).toBe(false);
      expect(isValidPosition({ x: 0, y: 8 })).toBe(false);
      expect(isValidPosition({ x: -1, y: -1 })).toBe(false);
      expect(isValidPosition({ x: 8, y: 8 })).toBe(false);
    });
  });

  describe('getPieceAt', () => {
    it('should return the piece at the given position', () => {
      const board = initBoard();
      expect(getPieceAt({ x: 0, y: 0 }, board)).toEqual({ type: PieceType.ROOK, color: Color.BLACK });
      expect(getPieceAt({ x: 4, y: 7 }, board)).toEqual({ type: PieceType.KING, color: Color.WHITE });
      expect(getPieceAt({ x: 3, y: 0 }, board)).toEqual({ type: PieceType.QUEEN, color: Color.BLACK });
    });

    it('should return null for empty positions', () => {
      const board = initBoard();
      expect(getPieceAt({ x: 0, y: 3 }, board)).toBeNull();
      expect(getPieceAt({ x: 4, y: 4 }, board)).toBeNull();
    });

    it('should return null for invalid positions', () => {
      const board = initBoard();
      expect(getPieceAt({ x: -1, y: 0 }, board)).toBeNull();
      expect(getPieceAt({ x: 0, y: -1 }, board)).toBeNull();
      expect(getPieceAt({ x: 8, y: 0 }, board)).toBeNull();
      expect(getPieceAt({ x: 0, y: 8 }, board)).toBeNull();
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

      expect(isPathClear({ x: 1, y: 3 }, { x: 6, y: 3 }, board)).toBe(true);
    });

    it('should return true if path is clear (vertically)', () => {
      const board = initBoard();
      // Clear column 4
      for (let row = 2; row <= 5; row++) {
        board[row][4] = null;
      }

      expect(isPathClear({ x: 4, y: 2 }, { x: 4, y: 5 }, board)).toBe(true);
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

      expect(isPathClear({ x: 1, y: 1 }, { x: 6, y: 6 }, board)).toBe(true);
      expect(isPathClear({ x: 2, y: 2 }, { x: 5, y: 5 }, board)).toBe(true);
    });

    it('should return false if path is not clear', () => {
      const board = initBoard();
      // Black pawns block the path
      expect(isPathClear({ x: 0, y: 0 }, { x: 0, y: 3 }, board)).toBe(false);
      // White pawns block the path
      expect(isPathClear({ x: 3, y: 7 }, { x: 3, y: 3 }, board)).toBe(false);
    });

    it('should return true for the same position', () => {
      const board = initBoard();
      expect(isPathClear({ x: 3, y: 3 }, { x: 3, y: 3 }, board)).toBe(true);
    });
  });

  describe('algebraicToPosition', () => {
    it('should convert algebraic notation to position correctly', () => {
      expect(algebraicToPosition('a1')).toEqual({ x: 0, y: 7 });
      expect(algebraicToPosition('h8')).toEqual({ x: 7, y: 0 });
      expect(algebraicToPosition('e4')).toEqual({ x: 4, y: 4 });
      expect(algebraicToPosition('c6')).toEqual({ x: 2, y: 2 });
    });
  });

  describe('positionToAlgebraic', () => {
    it('should convert position to algebraic notation correctly', () => {
      expect(positionToAlgebraic({ x: 0, y: 7 })).toBe('a1');
      expect(positionToAlgebraic({ x: 7, y: 0 })).toBe('h8');
      expect(positionToAlgebraic({ x: 4, y: 4 })).toBe('e4');
      expect(positionToAlgebraic({ x: 2, y: 2 })).toBe('c6');
    });
  });

  describe('algebraic and position conversions', () => {
    it('should be reversible', () => {
      const testPositions = [
        { x: 0, y: 0 },
        { x: 7, y: 7 },
        { x: 3, y: 2 },
        { x: 5, y: 6 },
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
});
