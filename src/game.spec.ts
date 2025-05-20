import { expect, describe, it } from 'vitest';
import {
  movePiece,
  isValidMove,
  initGameState,
  switchTurn,
  addMoveToHistory,
  getCurrentPlayer,
  getMoveHistory,
} from './game';
import { initBoard } from './board';
import { Color, PieceType, type GameState } from './types';

describe('Game functions', () => {
  // Create a fresh game state for each test
  const createGameState = (): GameState => ({
    board: initBoard(),
    currentTurn: Color.WHITE,
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
  });

  describe('isValidMove', () => {
    it('should return false for an invalid move', () => {
      const gameState = createGameState();

      // Try to move white pawn e2 to e5 (invalid as it's too far)
      const result = isValidMove(
        { col: 4, row: 6 }, // e2
        { col: 4, row: 3 }, // e5
        gameState
      );

      expect(result).toBe(false);
    });

    it('should return true for a valid move', () => {
      const gameState = createGameState();

      // Move white pawn e2 to e4 (valid two-square advance)
      const result = isValidMove(
        { col: 4, row: 6 }, // e2
        { col: 4, row: 4 }, // e4
        gameState
      );

      expect(result).toBe(true);
    });

    it("should return false when trying to move opponent's piece", () => {
      const gameState = createGameState();
      gameState.currentTurn = Color.WHITE;

      // Try to move black pawn e7 to e5
      const result = isValidMove(
        { col: 4, row: 1 }, // e7
        { col: 4, row: 3 }, // e5
        gameState
      );

      // This should be false because it's white's turn
      expect(result).toBe(false);
    });
  });

  describe('movePiece', () => {
    it('should return null for an invalid move', () => {
      const gameState = createGameState();

      // Try to move white pawn e2 to e5 (invalid as it's too far)
      const result = movePiece(
        { col: 4, row: 6 }, // e2
        { col: 4, row: 3 }, // e5
        gameState
      );

      expect(result).toBeNull();
    });

    it('should update the board for a valid move', () => {
      const gameState = createGameState();

      // Move white pawn e2 to e4
      const result = movePiece(
        { col: 4, row: 6 }, // e2
        { col: 4, row: 4 }, // e4
        gameState
      );

      expect(result).not.toBeNull();
      if (result) {
        // Board should be updated
        expect(result.board[6][4]).toBeNull(); // Original position should be empty
        expect(result.board[4][4]).toMatchObject({
          // New position should have the pawn
          type: PieceType.PAWN,
          color: Color.WHITE,
          hasMoved: true, // hasMoved should be updated
        });

        // Turn should be switched
        expect(result.currentTurn).toBe(Color.BLACK);

        // Move history should be updated
        expect(result.moveHistory.length).toBe(1);
        expect(result.moveHistory[0]).toMatchObject({
          from: { col: 4, row: 6 },
          to: { col: 4, row: 4 },
          piece: { type: PieceType.PAWN, color: Color.WHITE },
        });
      }
    });

    it('should correctly handle piece capture', () => {
      const gameState = createGameState();

      // First move white pawn e2 to e4
      let result = movePiece(
        { col: 4, row: 6 }, // e2
        { col: 4, row: 4 }, // e4
        gameState
      );

      if (!result) {
        throw new Error('First move failed');
      }

      // Then move black pawn d7 to d5
      result = movePiece(
        { col: 3, row: 1 }, // d7
        { col: 3, row: 3 }, // d5
        result
      );

      if (!result) {
        throw new Error('Second move failed');
      }

      // Finally, capture with white pawn e4 takes d5
      result = movePiece(
        { col: 4, row: 4 }, // e4
        { col: 3, row: 3 }, // d5
        result
      );

      expect(result).not.toBeNull();
      if (result) {
        // Board should be updated
        expect(result.board[4][4]).toBeNull(); // Original position should be empty
        expect(result.board[3][3]).toMatchObject({
          // New position should have the white pawn
          type: PieceType.PAWN,
          color: Color.WHITE,
          hasMoved: true,
        });

        // Move history should be updated with capture
        expect(result.moveHistory.length).toBe(3);
        expect(result.moveHistory[2]).toMatchObject({
          from: { col: 4, row: 4 },
          to: { col: 3, row: 3 },
          piece: { type: PieceType.PAWN, color: Color.WHITE },
          captured: { type: PieceType.PAWN, color: Color.BLACK },
        });
      }
    });

    it('should update hasMoved status', () => {
      const gameState = createGameState();

      // Move white king's knight to f3
      const result = movePiece(
        { col: 6, row: 7 }, // g1
        { col: 5, row: 5 }, // f3
        gameState
      );

      expect(result).not.toBeNull();
      if (result) {
        // Knight should have hasMoved set to true
        const knight = result.board[5][5];
        expect(knight).not.toBeNull();
        if (knight) {
          expect(knight.hasMoved).toBe(true);
        }
      }
    });

    it('should return original board state when the move is invalid', () => {
      const gameState = createGameState();
      const originalBoard = JSON.stringify(gameState.board);

      // Try an invalid move: move white king directly to e4
      const result = movePiece(
        { col: 4, row: 7 }, // e1
        { col: 4, row: 3 }, // e5
        gameState
      );

      expect(result).toBeNull();

      // Original game state should be unchanged
      expect(JSON.stringify(gameState.board)).toBe(originalBoard);
    });
  });
});

describe('Game State Management', () => {
  it('initGameState should create a new game with white to move first', () => {
    const gameState = initGameState();
    expect(gameState.currentTurn).toBe(Color.WHITE);
    expect(gameState.moveHistory).toHaveLength(0);
    expect(gameState.isCheck).toBe(false);
    expect(gameState.isCheckmate).toBe(false);
    expect(gameState.isStalemate).toBe(false);
  });

  it('switchTurn should change the current player', () => {
    const gameState = initGameState();
    expect(gameState.currentTurn).toBe(Color.WHITE);

    const newGameState = switchTurn(gameState);
    expect(newGameState.currentTurn).toBe(Color.BLACK);

    const finalGameState = switchTurn(newGameState);
    expect(finalGameState.currentTurn).toBe(Color.WHITE);
  });

  it('addMoveToHistory should add a move to history', () => {
    let gameState = initGameState();
    expect(gameState.moveHistory).toHaveLength(0);

    const from = { row: 6, col: 4 };
    const to = { row: 4, col: 4 };
    const piece = { type: PieceType.PAWN, color: Color.WHITE };

    gameState = addMoveToHistory(gameState, from, to, piece);
    expect(gameState.moveHistory).toHaveLength(1);
    expect(gameState.moveHistory[0].from).toEqual(from);
    expect(gameState.moveHistory[0].to).toEqual(to);
    expect(gameState.moveHistory[0].piece).toEqual(piece);
  });

  it('getCurrentPlayer should return the current player color', () => {
    const gameState = initGameState();
    expect(getCurrentPlayer(gameState)).toBe(Color.WHITE);

    const newGameState = switchTurn(gameState);
    expect(getCurrentPlayer(newGameState)).toBe(Color.BLACK);
  });

  it('getMoveHistory should return a copy of the move history', () => {
    let gameState = initGameState();

    const from = { row: 6, col: 4 };
    const to = { row: 4, col: 4 };
    const piece = { type: PieceType.PAWN, color: Color.WHITE };

    gameState = addMoveToHistory(gameState, from, to, piece);

    const history = getMoveHistory(gameState);
    expect(history).toHaveLength(1);
    expect(history[0].from).toEqual(from);

    // Verify it's a copy by modifying and checking original is unchanged
    history.push({
      from: { row: 0, col: 0 },
      to: { row: 1, col: 1 },
      piece: { type: PieceType.ROOK, color: Color.BLACK },
    });

    expect(history).toHaveLength(2);
    expect(gameState.moveHistory).toHaveLength(1);
  });
});
