import { describe, it, expect } from 'vitest';
import { getPawnMoves, isValidPawnMove } from './pawn';
import { initBoard } from '../board';
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
      const moves = getPawnMoves({ x: 4, y: 6 }, gameState); // White pawn at e2
      expect(moves).toContainEqual({
        from: { x: 4, y: 6 },
        to: { x: 4, y: 5 },
      });
    });

    it('should allow black pawn to move one square forward', () => {
      const gameState = createGameState();
      const moves = getPawnMoves({ x: 4, y: 1 }, gameState); // Black pawn at e7
      expect(moves).toContainEqual({
        from: { x: 4, y: 1 },
        to: { x: 4, y: 2 },
      });
    });

    it('should allow initial two square move for white pawn', () => {
      const gameState = createGameState();
      const moves = getPawnMoves({ x: 4, y: 6 }, gameState); // White pawn at e2
      expect(moves).toContainEqual({
        from: { x: 4, y: 6 },
        to: { x: 4, y: 4 },
        special: 'two-square-advance',
      });
    });

    it('should allow initial two square move for black pawn', () => {
      const gameState = createGameState();
      const moves = getPawnMoves({ x: 4, y: 1 }, gameState); // Black pawn at e7
      expect(moves).toContainEqual({
        from: { x: 4, y: 1 },
        to: { x: 4, y: 3 },
        special: 'two-square-advance',
      });
    });

    it('should not allow forward move if blocked', () => {
      const board = initBoard();
      board[5][4] = { type: PieceType.PAWN, color: Color.BLACK }; // Block white pawn
      const gameState = createGameState(board);
      const moves = getPawnMoves({ x: 4, y: 6 }, gameState); // White pawn at e2
      expect(moves).not.toContainEqual({
        from: { x: 4, y: 6 },
        to: { x: 4, y: 5 },
      });
    });

    it('should allow diagonal capture', () => {
      const board = initBoard();
      board[5][3] = { type: PieceType.PAWN, color: Color.BLACK }; // Enemy pawn to capture
      const gameState = createGameState(board);
      const moves = getPawnMoves({ x: 4, y: 6 }, gameState); // White pawn at e2
      expect(moves).toContainEqual({
        from: { x: 4, y: 6 },
        to: { x: 3, y: 5 },
        capture: true,
      });
    });

    it('should not allow diagonal move without capture', () => {
      const gameState = createGameState();
      const moves = getPawnMoves({ x: 4, y: 6 }, gameState); // White pawn at e2
      expect(moves).not.toContainEqual({
        from: { x: 4, y: 6 },
        to: { x: 3, y: 5 },
      });
    });

    it('should allow en passant capture for white pawn', () => {
      const board = initBoard();
      // Clear the initial pawns
      board[1][3] = null; // Clear black pawn
      board[6][4] = null; // Clear white pawn

      // Set up the position
      board[3][3] = { type: PieceType.PAWN, color: Color.BLACK }; // Black pawn after two-square move
      board[3][4] = { type: PieceType.PAWN, color: Color.WHITE }; // White pawn ready for en passant

      const gameState: GameState = {
        board,
        currentTurn: Color.WHITE,
        moveHistory: [
          {
            from: { x: 3, y: 1 },
            to: { x: 3, y: 3 },
            piece: { type: PieceType.PAWN, color: Color.BLACK },
            special: 'two-square-advance',
          },
        ],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
      };

      const moves = getPawnMoves({ x: 4, y: 3 }, gameState);
      expect(moves).toContainEqual({
        from: { x: 4, y: 3 },
        to: { x: 3, y: 2 },
        capture: true,
        special: 'en-passant',
        capturedPiecePosition: { x: 3, y: 3 },
      });
    });

    it('should allow en passant capture for black pawn', () => {
      const board = initBoard();
      // Clear the initial pawns
      board[1][3] = null; // Clear black pawn
      board[6][4] = null; // Clear white pawn

      // Set up the position
      board[4][3] = { type: PieceType.PAWN, color: Color.BLACK }; // Black pawn ready for en passant
      board[4][4] = { type: PieceType.PAWN, color: Color.WHITE }; // White pawn after two-square move

      const gameState: GameState = {
        board,
        currentTurn: Color.BLACK,
        moveHistory: [
          {
            from: { x: 4, y: 6 },
            to: { x: 4, y: 4 },
            piece: { type: PieceType.PAWN, color: Color.WHITE },
            special: 'two-square-advance',
          },
        ],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
      };

      const moves = getPawnMoves({ x: 3, y: 4 }, gameState);
      expect(moves).toContainEqual({
        from: { x: 3, y: 4 },
        to: { x: 4, y: 5 },
        capture: true,
        special: 'en-passant',
        capturedPiecePosition: { x: 4, y: 4 },
      });
    });

    it('should not allow en passant if not immediately after two-square advance', () => {
      const board = initBoard();
      // Clear the initial pawns
      board[1][3] = null; // Clear black pawn
      board[6][4] = null; // Clear white pawn

      // Set up the position
      board[3][3] = { type: PieceType.PAWN, color: Color.BLACK }; // Black pawn after two-square move
      board[3][4] = { type: PieceType.PAWN, color: Color.WHITE }; // White pawn ready for en passant

      const gameState: GameState = {
        board,
        currentTurn: Color.WHITE,
        moveHistory: [
          {
            from: { x: 3, y: 1 },
            to: { x: 3, y: 3 },
            piece: { type: PieceType.PAWN, color: Color.BLACK },
            special: 'two-square-advance',
          },
          {
            from: { x: 0, y: 6 },
            to: { x: 0, y: 5 },
            piece: { type: PieceType.PAWN, color: Color.WHITE },
          },
        ],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
      };

      const moves = getPawnMoves({ x: 4, y: 3 }, gameState);
      expect(moves).not.toContainEqual({
        from: { x: 4, y: 3 },
        to: { x: 3, y: 2 },
        capture: true,
        special: 'en-passant',
        capturedPiecePosition: { x: 3, y: 3 },
      });
    });
  });

  describe('isValidPawnMove', () => {
    it('should return true for valid moves', () => {
      const gameState = createGameState();
      expect(isValidPawnMove({ x: 4, y: 6 }, { x: 4, y: 5 }, gameState)).toBe(true); // Forward move
      expect(isValidPawnMove({ x: 4, y: 6 }, { x: 4, y: 4 }, gameState)).toBe(true); // Initial two squares
    });

    it('should return false for invalid moves', () => {
      const gameState = createGameState();
      expect(isValidPawnMove({ x: 4, y: 6 }, { x: 4, y: 7 }, gameState)).toBe(false); // Backward move
      expect(isValidPawnMove({ x: 4, y: 6 }, { x: 3, y: 5 }, gameState)).toBe(false); // Diagonal without capture
    });

    it('should return true for valid en passant moves', () => {
      const board = initBoard();
      // Clear the initial pawns
      board[1][3] = null; // Clear black pawn
      board[6][4] = null; // Clear white pawn

      // Set up the position
      board[3][3] = { type: PieceType.PAWN, color: Color.BLACK }; // Black pawn after two-square move
      board[3][4] = { type: PieceType.PAWN, color: Color.WHITE }; // White pawn ready for en passant

      const gameState: GameState = {
        board,
        currentTurn: Color.WHITE,
        moveHistory: [
          {
            from: { x: 3, y: 1 },
            to: { x: 3, y: 3 },
            piece: { type: PieceType.PAWN, color: Color.BLACK },
            special: 'two-square-advance',
          },
        ],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
      };

      expect(isValidPawnMove({ x: 4, y: 3 }, { x: 3, y: 2 }, gameState)).toBe(true);
    });
  });
});
