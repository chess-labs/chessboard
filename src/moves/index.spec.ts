import { expect, describe, it } from 'vitest';
import { getLegalMoves } from './index';
import { clearPosition, initBoard, placePiece } from '../board';
import { type GameState, Color, PieceType } from '../types';

describe('getLegalMoves', () => {
  // Create a fresh game state for each test
  const createGameState = (): GameState => ({
    board: initBoard(),
    currentTurn: Color.WHITE,
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
  });

  it('should return empty array for invalid position', () => {
    const gameState = createGameState();
    const moves = getLegalMoves({ col: -1, row: 5 }, gameState);
    expect(moves).toEqual([]);
  });

  it('should return empty array for empty square', () => {
    const gameState = createGameState();
    // Position at e4 which is empty in initial position
    const moves = getLegalMoves({ col: 4, row: 3 }, gameState);
    expect(moves).toEqual([]);
  });

  it('should return pawn moves for white pawn', () => {
    const gameState = createGameState();
    // Position of a white pawn at e2
    const moves = getLegalMoves({ col: 4, row: 6 }, gameState);

    // Should have two moves (one square and two squares forward)
    expect(moves.length).toBe(2);

    // Check moves are correct
    expect(moves).toContainEqual(
      expect.objectContaining({
        from: { col: 4, row: 6 },
        to: { col: 4, row: 5 },
      })
    );
    expect(moves).toContainEqual(
      expect.objectContaining({
        from: { col: 4, row: 6 },
        to: { col: 4, row: 4 },
        special: 'two-square-advance',
      })
    );
  });

  it('should return knight moves for white knight', () => {
    const gameState = createGameState();
    // Position of a white knight at b1
    const moves = getLegalMoves({ col: 1, row: 7 }, gameState);

    // Knight at initial position can move to a3 and c3
    expect(moves.length).toBe(2);

    // Check moves are correct
    expect(moves).toContainEqual(
      expect.objectContaining({
        from: { col: 1, row: 7 },
        to: { col: 0, row: 5 },
      })
    );
    expect(moves).toContainEqual(
      expect.objectContaining({
        from: { col: 1, row: 7 },
        to: { col: 2, row: 5 },
      })
    );
  });

  it('should prevent capturing own pieces', () => {
    const gameState = createGameState();

    // Clear the board
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        clearPosition(gameState.board, { col, row });
      }
    }

    // Place a white king at e4
    placePiece(gameState.board, { col: 4, row: 3 }, { type: PieceType.KING, color: Color.WHITE });

    // Place a white pawn at e5 (in front of the king)
    placePiece(gameState.board, { col: 4, row: 2 }, { type: PieceType.PAWN, color: Color.WHITE });

    // Get legal moves for the king
    const moves = getLegalMoves({ col: 4, row: 3 }, gameState);

    // King can move to all 8 surrounding squares except e5 (occupied by own pawn)
    expect(moves.length).toBe(7);

    // Make sure there's no move to e5
    expect(moves.some((move) => move.to.col === 4 && move.to.row === 2)).toBe(false);
  });

  it('should allow capturing opponent pieces', () => {
    const gameState = createGameState();

    // Clear the board
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        clearPosition(gameState.board, { col, row });
      }
    }

    // Place a white bishop at e4
    placePiece(gameState.board, { col: 4, row: 3 }, { type: PieceType.BISHOP, color: Color.WHITE });

    // Place a black pawn at g6 (diagonal to the bishop)
    placePiece(gameState.board, { col: 6, row: 1 }, { type: PieceType.PAWN, color: Color.BLACK });

    console.log('Bishop position:', { col: 4, row: 3 });
    console.log('Pawn position:', { col: 6, row: 1 });

    // Get legal moves for the bishop
    const moves = getLegalMoves({ col: 4, row: 3 }, gameState);
    console.log('Available moves:', JSON.stringify(moves, null, 2));

    // Check that capture move exists
    const captureMove = moves.find((move) => move.to.col === 6 && move.to.row === 1);
    expect(captureMove).toBeDefined();
    expect(captureMove?.capture).toBe(true);
  });

  // TODO: Add tests for castling, en passant, promotion, etc.

  // TODO: Add tests for check and checkmate
});
