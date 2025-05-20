import { describe, it, expect } from 'vitest';
import { getPawnMoves, isValidPawnMove } from './pawn';
import { clearPosition, initBoard, placePiece } from '../board';
import { Color, PieceType, type GameState } from '../types';

describe('Pawn moves', () => {
  const createGameState = (board = initBoard()): GameState => ({
    board,
    currentTurn: Color.WHITE,
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
  });

  describe('getPawnMoves', () => {
    it('should allow white pawn to move one square forward', () => {
      const gameState = createGameState();
      const moves = getPawnMoves({ col: 4, row: 6 }, gameState); // White pawn at e2
      expect(moves).toContainEqual({
        from: { col: 4, row: 6 },
        to: { col: 4, row: 5 },
      });
    });

    it('should allow black pawn to move one square forward', () => {
      const gameState = createGameState();
      const moves = getPawnMoves({ col: 4, row: 1 }, gameState); // Black pawn at e7
      expect(moves).toContainEqual({
        from: { col: 4, row: 1 },
        to: { col: 4, row: 2 },
      });
    });

    it('should allow initial two square move for white pawn', () => {
      const gameState = createGameState();
      const moves = getPawnMoves({ col: 4, row: 6 }, gameState); // White pawn at e2
      expect(moves).toContainEqual({
        from: { col: 4, row: 6 },
        to: { col: 4, row: 4 },
        special: 'two-square-advance',
      });
    });

    it('should allow initial two square move for black pawn', () => {
      const gameState = createGameState();
      const moves = getPawnMoves({ col: 4, row: 1 }, gameState); // Black pawn at e7
      expect(moves).toContainEqual({
        from: { col: 4, row: 1 },
        to: { col: 4, row: 3 },
        special: 'two-square-advance',
      });
    });

    it('should not allow forward move if blocked', () => {
      const board = initBoard();
      placePiece(board, { col: 4, row: 5 }, { type: PieceType.PAWN, color: Color.BLACK }); // Block white pawn
      const gameState = createGameState(board);
      const moves = getPawnMoves({ col: 4, row: 6 }, gameState); // White pawn at e2
      expect(moves).not.toContainEqual({
        from: { col: 4, row: 6 },
        to: { col: 4, row: 5 },
      });
    });

    it('should allow diagonal capture', () => {
      const board = initBoard();
      placePiece(board, { col: 3, row: 5 }, { type: PieceType.PAWN, color: Color.BLACK }); // Enemy pawn to capture
      const gameState = createGameState(board);
      const moves = getPawnMoves({ col: 4, row: 6 }, gameState); // White pawn at e2
      expect(moves).toContainEqual({
        from: { col: 4, row: 6 },
        to: { col: 3, row: 5 },
        capture: true,
      });
    });

    it('should not allow diagonal move without capture', () => {
      const gameState = createGameState();
      const moves = getPawnMoves({ col: 4, row: 6 }, gameState); // White pawn at e2
      expect(moves).not.toContainEqual({
        from: { col: 4, row: 6 },
        to: { col: 3, row: 5 },
      });
    });

    it('should allow en passant capture for white pawn', () => {
      const board = initBoard();
      // Clear the initial pawns
      clearPosition(board, { col: 4, row: 6 }); // Clear white pawn
      clearPosition(board, { col: 3, row: 1 }); // Clear black pawn

      // Set up the position
      placePiece(board, { col: 4, row: 3 }, { type: PieceType.PAWN, color: Color.WHITE }); // White pawn ready for en passant
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.PAWN, color: Color.BLACK }); // Black pawn after two-square move

      const gameState: GameState = {
        board,
        currentTurn: Color.WHITE,
        moveHistory: [
          {
            from: { col: 3, row: 1 },
            to: { col: 3, row: 3 },
            piece: { type: PieceType.PAWN, color: Color.BLACK },
            special: 'two-square-advance',
          },
        ],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
      };

      const moves = getPawnMoves({ col: 4, row: 3 }, gameState);
      expect(moves).toContainEqual({
        from: { col: 4, row: 3 },
        to: { col: 3, row: 2 },
        capture: true,
        special: 'en-passant',
        capturedPiecePosition: { col: 3, row: 3 },
      });
    });

    it('should allow en passant capture for black pawn', () => {
      const board = initBoard();
      // Clear the initial pawns
      clearPosition(board, { col: 4, row: 6 }); // Clear white pawn
      clearPosition(board, { col: 3, row: 1 }); // Clear black pawn

      // Set up the position
      placePiece(board, { col: 4, row: 4 }, { type: PieceType.PAWN, color: Color.WHITE }); // White pawn after two-square move
      placePiece(board, { col: 3, row: 4 }, { type: PieceType.PAWN, color: Color.BLACK }); // Black pawn ready for en passant

      const gameState: GameState = {
        board,
        currentTurn: Color.BLACK,
        moveHistory: [
          {
            from: { col: 4, row: 6 },
            to: { col: 4, row: 4 },
            piece: { type: PieceType.PAWN, color: Color.WHITE },
            special: 'two-square-advance',
          },
        ],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
      };

      const moves = getPawnMoves({ col: 3, row: 4 }, gameState);
      expect(moves).toContainEqual({
        from: { col: 3, row: 4 },
        to: { col: 4, row: 5 },
        capture: true,
        special: 'en-passant',
        capturedPiecePosition: { col: 4, row: 4 },
      });
    });

    it('should not allow en passant if not immediately after two-square advance', () => {
      const board = initBoard();
      // Clear the initial pawns
      clearPosition(board, { col: 4, row: 6 }); // Clear white pawn
      clearPosition(board, { col: 3, row: 1 }); // Clear black pawn

      // Set up the position
      placePiece(board, { col: 4, row: 3 }, { type: PieceType.PAWN, color: Color.WHITE }); // White pawn ready for en passant
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.PAWN, color: Color.BLACK }); // Black pawn after two-square move

      const gameState: GameState = {
        board,
        currentTurn: Color.WHITE,
        moveHistory: [
          {
            from: { col: 3, row: 1 },
            to: { col: 3, row: 3 },
            piece: { type: PieceType.PAWN, color: Color.BLACK },
            special: 'two-square-advance',
          },
          {
            from: { col: 0, row: 6 },
            to: { col: 0, row: 5 },
            piece: { type: PieceType.PAWN, color: Color.WHITE },
          },
        ],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
      };

      const moves = getPawnMoves({ col: 4, row: 3 }, gameState);
      expect(moves).not.toContainEqual({
        from: { col: 4, row: 3 },
        to: { col: 3, row: 2 },
        capture: true,
        special: 'en-passant',
        capturedPiecePosition: { col: 3, row: 3 },
      });
    });
  });

  describe('isValidPawnMove', () => {
    it('should return true for valid moves', () => {
      const gameState = createGameState();
      expect(isValidPawnMove({ col: 4, row: 6 }, { col: 4, row: 5 }, gameState)).toBe(true); // Forward move
      expect(isValidPawnMove({ col: 4, row: 6 }, { col: 4, row: 4 }, gameState)).toBe(true); // Initial two squares
    });

    it('should return false for invalid moves', () => {
      const gameState = createGameState();
      expect(isValidPawnMove({ col: 4, row: 6 }, { col: 4, row: 7 }, gameState)).toBe(false); // Backward move
      expect(isValidPawnMove({ col: 4, row: 6 }, { col: 3, row: 5 }, gameState)).toBe(false); // Diagonal without capture
    });

    it('should return true for valid en passant moves', () => {
      const board = initBoard();
      // Clear the initial pawns
      clearPosition(board, { col: 4, row: 6 }); // Clear white pawn
      clearPosition(board, { col: 3, row: 1 }); // Clear black pawn

      // Set up the position
      placePiece(board, { col: 4, row: 3 }, { type: PieceType.PAWN, color: Color.WHITE }); // White pawn ready for en passant
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.PAWN, color: Color.BLACK }); // Black pawn after two-square move

      const gameState: GameState = {
        board,
        currentTurn: Color.WHITE,
        moveHistory: [
          {
            from: { col: 3, row: 1 },
            to: { col: 3, row: 3 },
            piece: { type: PieceType.PAWN, color: Color.BLACK },
            special: 'two-square-advance',
          },
        ],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
      };

      expect(isValidPawnMove({ col: 4, row: 3 }, { col: 3, row: 2 }, gameState)).toBe(true);
    });
  });
});
