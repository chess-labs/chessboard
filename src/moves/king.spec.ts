import { describe, it, expect, beforeEach } from 'vitest';
import { getKingMoves, isValidKingMove, canCastle } from './king';
import { clearBoard, clearPosition, initBoard, placePiece } from '../board';
import { Color, PieceType } from '../types';
import type { GameState } from '../types';
import { isPlayerInCheck } from '../game';
import { vi } from 'vitest';

// Mock isPlayerInCheck function from '../game'
vi.mock('../game', () => ({
  isPlayerInCheck: vi.fn().mockReturnValue(false),
}));

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
      clearBoard(board);
      // Place king in the center
      const kingCol = 4;
      const kingRow = 4;
      placePiece(board, { col: kingCol, row: kingRow }, { type: PieceType.KING, color: Color.WHITE });

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
      clearBoard(board);
      // Place king in the corner
      placePiece(board, { col: 0, row: 0 }, { type: PieceType.KING, color: Color.WHITE });

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
      clearBoard(board);
      // Place king
      placePiece(board, { col: 4, row: 4 }, { type: PieceType.KING, color: Color.WHITE });
      // Place an opponent piece
      placePiece(board, { col: 5, row: 4 }, { type: PieceType.PAWN, color: Color.BLACK });

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
      clearBoard(board);
      // Place king
      placePiece(board, { col: 4, row: 4 }, { type: PieceType.KING, color: Color.WHITE });
      // Place a piece of the same color
      placePiece(board, { col: 5, row: 4 }, { type: PieceType.PAWN, color: Color.WHITE });

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
      clearBoard(board);
      // Place king
      placePiece(board, { col: 4, row: 4 }, { type: PieceType.KING, color: Color.WHITE });

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
      clearBoard(board);
      // Place king
      placePiece(board, { col: 4, row: 4 }, { type: PieceType.KING, color: Color.WHITE });

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
      clearBoard(board);
      // Place king
      placePiece(board, { col: 4, row: 4 }, { type: PieceType.KING, color: Color.WHITE });
      // Place a piece of the same color
      placePiece(board, { col: 5, row: 4 }, { type: PieceType.PAWN, color: Color.WHITE });

      const gameState = createGameState(board);

      expect(isValidKingMove({ col: 4, row: 4 }, { col: 5, row: 4 }, gameState)).toBe(false);
    });
  });

  // 새로운 캐슬링 테스트 추가
  describe('castling', () => {
    beforeEach(() => {
      vi.mocked(isPlayerInCheck).mockReset().mockReturnValue(false);
    });

    it('should include kingside castling as a legal move when conditions are met', () => {
      const board = initBoard();
      // Clear the board
      clearBoard(board);

      // Place white king in initial position
      const kingPos = { col: 4, row: 7 };
      placePiece(board, kingPos, { type: PieceType.KING, color: Color.WHITE, hasMoved: false });

      // Place white kingside rook in initial position
      const kingsideRookPos = { col: 7, row: 7 };
      placePiece(board, kingsideRookPos, { type: PieceType.ROOK, color: Color.WHITE, hasMoved: false });

      const gameState = createGameState(board);
      const moves = getKingMoves(kingPos, gameState);

      // Should include castling move
      expect(moves).toContainEqual({
        from: kingPos,
        to: { col: 6, row: 7 },
        special: 'castling',
      });
    });

    it('should include queenside castling as a legal move when conditions are met', () => {
      const board = initBoard();
      // Clear the board
      clearBoard(board);

      // Place white king in initial position
      const kingPos = { col: 4, row: 7 };
      placePiece(board, kingPos, { type: PieceType.KING, color: Color.WHITE, hasMoved: false });

      // Place white queenside rook in initial position
      const queensideRookPos = { col: 0, row: 7 };
      placePiece(board, queensideRookPos, { type: PieceType.ROOK, color: Color.WHITE, hasMoved: false });

      const gameState = createGameState(board);
      const moves = getKingMoves(kingPos, gameState);

      // Should include castling move
      expect(moves).toContainEqual({
        from: kingPos,
        to: { col: 2, row: 7 },
        special: 'castling',
      });
    });

    it('should not allow castling if king has moved', () => {
      const board = initBoard();
      // Clear the board
      clearBoard(board);

      // Place white king that has moved
      const kingPos = { col: 4, row: 7 };
      placePiece(board, kingPos, { type: PieceType.KING, color: Color.WHITE, hasMoved: true });

      // Place white kingside rook that hasn't moved
      const rookPos = { col: 7, row: 7 };
      placePiece(board, rookPos, { type: PieceType.ROOK, color: Color.WHITE, hasMoved: false });

      const gameState = createGameState(board);

      // Should not be able to castle
      expect(canCastle(kingPos, rookPos, gameState)).toBe(false);

      // Kingside castling should not be in legal moves
      const moves = getKingMoves(kingPos, gameState);
      expect(moves).not.toContainEqual({
        from: kingPos,
        to: { col: 6, row: 7 },
        special: 'castling',
      });
    });

    it('should not allow castling if rook has moved', () => {
      const board = initBoard();
      // Clear the board
      clearBoard(board);

      // Place white king that hasn't moved
      const kingPos = { col: 4, row: 7 };
      placePiece(board, kingPos, { type: PieceType.KING, color: Color.WHITE, hasMoved: false });

      // Place white kingside rook that has moved
      const rookPos = { col: 7, row: 7 };
      placePiece(board, rookPos, { type: PieceType.ROOK, color: Color.WHITE, hasMoved: true });

      const gameState = createGameState(board);

      // Should not be able to castle
      expect(canCastle(kingPos, rookPos, gameState)).toBe(false);

      // Kingside castling should not be in legal moves
      const moves = getKingMoves(kingPos, gameState);
      expect(moves).not.toContainEqual({
        from: kingPos,
        to: { col: 6, row: 7 },
        special: 'castling',
      });
    });

    it('should not allow castling when pieces are between king and rook', () => {
      const board = initBoard();
      // Clear the board
      clearBoard(board);

      // Place white king in initial position
      const kingPos = { col: 4, row: 7 };
      placePiece(board, kingPos, { type: PieceType.KING, color: Color.WHITE, hasMoved: false });

      // Place white kingside rook in initial position
      const rookPos = { col: 7, row: 7 };
      placePiece(board, rookPos, { type: PieceType.ROOK, color: Color.WHITE, hasMoved: false });

      // Place bishop between king and rook
      placePiece(board, { col: 5, row: 7 }, { type: PieceType.BISHOP, color: Color.WHITE });

      const gameState = createGameState(board);

      // Should not be able to castle
      expect(canCastle(kingPos, rookPos, gameState)).toBe(false);

      // Kingside castling should not be in legal moves
      const moves = getKingMoves(kingPos, gameState);
      expect(moves).not.toContainEqual({
        from: kingPos,
        to: { col: 6, row: 7 },
        special: 'castling',
      });
    });

    it('should not allow castling when king is in check', () => {
      const board = initBoard();
      // Clear the board
      clearBoard(board);

      // Place white king in initial position
      const kingPos = { col: 4, row: 7 };
      placePiece(board, kingPos, { type: PieceType.KING, color: Color.WHITE, hasMoved: false });

      // Place white kingside rook in initial position
      const rookPos = { col: 7, row: 7 };
      placePiece(board, rookPos, { type: PieceType.ROOK, color: Color.WHITE, hasMoved: false });

      const gameState = createGameState(board);

      // Mock that king is in check
      vi.mocked(isPlayerInCheck).mockReturnValue(true);

      // Should not be able to castle
      expect(canCastle(kingPos, rookPos, gameState)).toBe(false);

      // Kingside castling should not be in legal moves
      const moves = getKingMoves(kingPos, gameState);
      expect(moves).not.toContainEqual({
        from: kingPos,
        to: { col: 6, row: 7 },
        special: 'castling',
      });
    });

    it('should not allow castling when king would pass through a square under attack', () => {
      const board = initBoard();
      // Clear the board
      clearBoard(board);

      // Place white king in initial position
      const kingPos = { col: 4, row: 7 };
      placePiece(board, kingPos, { type: PieceType.KING, color: Color.WHITE, hasMoved: false });

      // Place white kingside rook in initial position
      const rookPos = { col: 7, row: 7 };
      placePiece(board, rookPos, { type: PieceType.ROOK, color: Color.WHITE, hasMoved: false });

      const gameState = createGameState(board);

      // Mock that king would be in check when moving through f1 (the square it passes)
      vi.mocked(isPlayerInCheck).mockImplementation((gs, color) => {
        // We're examining a temporary board state with king at f1 (col 5)
        if (gs.board[7][5] && gs.board[7][5]?.type === PieceType.KING) {
          return true;
        }
        return false;
      });

      // Should not be able to castle
      expect(canCastle(kingPos, rookPos, gameState)).toBe(false);

      // Kingside castling should not be in legal moves
      const moves = getKingMoves(kingPos, gameState);
      expect(moves).not.toContainEqual({
        from: kingPos,
        to: { col: 6, row: 7 },
        special: 'castling',
      });
    });

    it('should correctly validate a castling move in isValidKingMove', () => {
      const board = initBoard();
      // Clear the board
      clearBoard(board);

      // Place white king in initial position
      const kingPos = { col: 4, row: 7 };
      placePiece(board, kingPos, { type: PieceType.KING, color: Color.WHITE, hasMoved: false });

      // Place white kingside rook in initial position
      const rookPos = { col: 7, row: 7 };
      placePiece(board, rookPos, { type: PieceType.ROOK, color: Color.WHITE, hasMoved: false });

      const gameState = createGameState(board);

      // Should be valid to castle kingside
      expect(isValidKingMove(kingPos, { col: 6, row: 7 }, gameState)).toBe(true);
    });
  });
});
