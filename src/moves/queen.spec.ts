import { describe, it, expect } from 'vitest';
import { getQueenMoves, isValidQueenMove } from './queen';
import { initBoard, placePiece, clearPosition, clearBoard } from '../board';
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
      clearBoard(board);
      // Place a queen in the center of the board
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.QUEEN, color: Color.WHITE });

      const gameState = createGameState(board);
      const moves = getQueenMoves({ col: 3, row: 3 }, gameState);

      // Check horizontal moves
      expect(moves).toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 0, row: 3 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 7, row: 3 },
        capture: false,
      });
    });

    it('should allow vertical moves like a rook', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      clearBoard(board);
      // Place a queen in the center of the board
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.QUEEN, color: Color.WHITE });

      const gameState = createGameState(board);
      const moves = getQueenMoves({ col: 3, row: 3 }, gameState);

      // Check vertical moves
      expect(moves).toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 3, row: 0 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 3, row: 7 },
        capture: false,
      });
    });

    it('should allow diagonal moves like a bishop', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      clearBoard(board);
      // Place a queen in the center of the board
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.QUEEN, color: Color.WHITE });

      const gameState = createGameState(board);
      const moves = getQueenMoves({ col: 3, row: 3 }, gameState);

      // Check diagonal moves
      expect(moves).toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 0, row: 0 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 6, row: 0 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 0, row: 6 },
        capture: false,
      });
      expect(moves).toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 6, row: 6 },
        capture: false,
      });
    });

    it('should detect and stop at blocking pieces of the same color', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      clearBoard(board);
      // Place a queen and blocking pieces of the same color
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.QUEEN, color: Color.WHITE });
      placePiece(board, { col: 3, row: 5 }, { type: PieceType.PAWN, color: Color.WHITE }); // vertical block
      placePiece(board, { col: 5, row: 3 }, { type: PieceType.PAWN, color: Color.WHITE }); // horizontal block
      placePiece(board, { col: 5, row: 5 }, { type: PieceType.PAWN, color: Color.WHITE }); // diagonal block

      const gameState = createGameState(board);
      const moves = getQueenMoves({ col: 3, row: 3 }, gameState);

      // Should be able to move vertically up to but not including the blocking piece
      expect(moves).toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 3, row: 4 },
        capture: false,
      });

      // Should not be able to move to or past the blocking piece (vertical)
      expect(moves).not.toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 3, row: 5 },
        capture: false,
      });
      expect(moves).not.toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 3, row: 6 },
        capture: false,
      });

      // Should not be able to move to or past the blocking piece (horizontal)
      expect(moves).not.toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 5, row: 3 },
        capture: false,
      });
      expect(moves).not.toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 6, row: 3 },
        capture: false,
      });

      // Should not be able to move to or past the blocking piece (diagonal)
      expect(moves).not.toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 5, row: 5 },
        capture: false,
      });
      expect(moves).not.toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 6, row: 6 },
        capture: false,
      });
    });

    it('should allow capturing opponent pieces', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      clearBoard(board);
      // Place a queen and opponent pieces
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.QUEEN, color: Color.WHITE });
      placePiece(board, { col: 3, row: 5 }, { type: PieceType.PAWN, color: Color.BLACK }); // vertical
      placePiece(board, { col: 5, row: 3 }, { type: PieceType.PAWN, color: Color.BLACK }); // horizontal
      placePiece(board, { col: 5, row: 5 }, { type: PieceType.PAWN, color: Color.BLACK }); // diagonal

      const gameState = createGameState(board);
      const moves = getQueenMoves({ col: 3, row: 3 }, gameState);

      // Should be able to capture the opponent piece (vertical)
      expect(moves).toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 3, row: 5 },
        capture: true,
      });

      // Should not be able to move past the captured piece (vertical)
      expect(moves).not.toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 3, row: 6 },
        capture: false,
      });

      // Should be able to capture the opponent piece (horizontal)
      expect(moves).toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 5, row: 3 },
        capture: true,
      });

      // Should not be able to move past the captured piece (horizontal)
      expect(moves).not.toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 6, row: 3 },
        capture: false,
      });

      // Should be able to capture the opponent piece (diagonal)
      expect(moves).toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 5, row: 5 },
        capture: true,
      });

      // Should not be able to move past the captured piece (diagonal)
      expect(moves).not.toContainEqual({
        from: { col: 3, row: 3 },
        to: { col: 6, row: 6 },
        capture: false,
      });
    });

    it('should not return moves for non-queen pieces', () => {
      const gameState = createGameState();
      const moves = getQueenMoves({ col: 0, row: 1 }, gameState); // Pawn position
      expect(moves).toHaveLength(0);
    });
  });

  describe('isValidQueenMove', () => {
    it('should return true for valid horizontal, vertical, and diagonal moves', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      clearBoard(board);
      // Place a queen
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.QUEEN, color: Color.WHITE });

      const gameState = createGameState(board);

      // Valid horizontal moves
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 0, row: 3 }, gameState)).toBe(true);
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 7, row: 3 }, gameState)).toBe(true);

      // Valid vertical moves
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 3, row: 0 }, gameState)).toBe(true);
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 3, row: 7 }, gameState)).toBe(true);

      // Valid diagonal moves
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 0, row: 0 }, gameState)).toBe(true);
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 6, row: 0 }, gameState)).toBe(true);
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 0, row: 6 }, gameState)).toBe(true);
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 6, row: 6 }, gameState)).toBe(true);
    });

    it('should return false for non-queen moves', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      clearBoard(board);
      // Place a queen
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.QUEEN, color: Color.WHITE });

      const gameState = createGameState(board);

      // Knight-like moves are invalid for queens
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 5, row: 4 }, gameState)).toBe(false);
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 1, row: 2 }, gameState)).toBe(false);
    });

    it('should return false when path is blocked', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      clearBoard(board);
      // Place a queen and a blocking piece
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.QUEEN, color: Color.WHITE });
      placePiece(board, { col: 3, row: 5 }, { type: PieceType.PAWN, color: Color.WHITE }); // vertical block
      placePiece(board, { col: 5, row: 3 }, { type: PieceType.PAWN, color: Color.WHITE }); // horizontal block
      placePiece(board, { col: 5, row: 5 }, { type: PieceType.PAWN, color: Color.WHITE }); // diagonal block

      const gameState = createGameState(board);

      // Path is blocked by own pieces
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 3, row: 7 }, gameState)).toBe(false);
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 7, row: 3 }, gameState)).toBe(false);
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 7, row: 7 }, gameState)).toBe(false);
    });

    it('should return true when capturing an opponent piece', () => {
      const board = initBoard();
      // Clear the board to make space for testing
      clearBoard(board);
      // Place a queen and an opponent piece
      placePiece(board, { col: 3, row: 3 }, { type: PieceType.QUEEN, color: Color.WHITE });
      placePiece(board, { col: 3, row: 5 }, { type: PieceType.PAWN, color: Color.BLACK });

      const gameState = createGameState(board);

      // Can capture opponent piece
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 3, row: 5 }, gameState)).toBe(true);

      // Cannot move past the opponent piece
      expect(isValidQueenMove({ col: 3, row: 3 }, { col: 3, row: 6 }, gameState)).toBe(false);
    });

    it('should return false for non-queen pieces', () => {
      const gameState = createGameState();

      // Pawn position
      expect(isValidQueenMove({ col: 0, row: 1 }, { col: 0, row: 3 }, gameState)).toBe(false);
    });
  });
});
