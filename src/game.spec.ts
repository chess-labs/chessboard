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
import { clearBoard, initBoard, placePiece } from './board';
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

    it('should correctly handle en passant capture', () => {
      const gameState = createGameState();

      // 1. Move white pawn e2 to e4 (two-square advance)
      let result = movePiece(
        { col: 4, row: 6 }, // e2
        { col: 4, row: 4 }, // e4
        gameState
      );
      if (!result) {
        throw new Error('First move failed');
      }

      // 2. Make a different move for black
      result = movePiece(
        { col: 0, row: 1 }, // a7
        { col: 0, row: 2 }, // a6
        result
      );
      if (!result) {
        throw new Error('Second move failed');
      }

      // 3. Move white pawn to e5
      result = movePiece(
        { col: 4, row: 4 }, // e4
        { col: 4, row: 3 }, // e5
        result
      );
      if (!result) {
        throw new Error('Third move failed');
      }

      // 4. Move black pawn d7 to d5 (two-square advance next to white pawn at e5)
      result = movePiece(
        { col: 3, row: 1 }, // d7
        { col: 3, row: 3 }, // d5
        result
      );
      if (!result) {
        throw new Error('Fourth move failed');
      }

      // 5. Perform en passant: white pawn captures from e5 to d6, removing black pawn at d5
      result = movePiece(
        { col: 4, row: 3 }, // e5
        { col: 3, row: 2 }, // d6
        result
      );

      expect(result).not.toBeNull();
      if (result) {
        // White pawn should be at d6
        expect(result.board[2][3]).toMatchObject({
          type: PieceType.PAWN,
          color: Color.WHITE,
          hasMoved: true,
        });

        // Black pawn at d5 should be captured (square should be empty)
        expect(result.board[3][3]).toBeNull();

        // Original position (e5) should be empty
        expect(result.board[3][4]).toBeNull();

        // Move history should include the capture and special move
        expect(result.moveHistory[4]).toMatchObject({
          from: { col: 4, row: 3 },
          to: { col: 3, row: 2 },
          piece: { type: PieceType.PAWN, color: Color.WHITE },
          captured: { type: PieceType.PAWN, color: Color.BLACK },
          special: 'en-passant',
        });
      }
    });

    it('should correctly handle pawn promotion', () => {
      // Set up a board with a pawn close to promotion
      const gameState = createGameState();

      // Clear the board
      clearBoard(gameState.board);

      // Place a white pawn one step away from promotion
      placePiece(gameState.board, { col: 4, row: 1 }, { type: PieceType.PAWN, color: Color.WHITE, hasMoved: true });
      switchTurn(gameState);

      // Move the pawn to the last rank for promotion (e7 to e8)
      const result = movePiece(
        { col: 4, row: 1 }, // e7
        { col: 4, row: 0 }, // e8
        gameState
      );

      expect(result).not.toBeNull();
      if (result) {
        // Original position should be empty
        expect(result.board[1][4]).toBeNull();

        // New position should have a queen (default promotion piece)
        expect(result.board[0][4]).toMatchObject({
          type: PieceType.QUEEN,
          color: Color.WHITE,
          hasMoved: true,
        });

        // Move history should include the promotion
        expect(result.moveHistory[0]).toMatchObject({
          from: { col: 4, row: 1 },
          to: { col: 4, row: 0 },
          piece: { type: PieceType.PAWN, color: Color.WHITE },
          special: 'promotion',
          promotedTo: PieceType.QUEEN,
        });
      }
    });

    it('should correctly handle pawn promotion with capture', () => {
      // Set up a board with a pawn close to promotion and an enemy piece to capture
      const gameState = createGameState();

      // Clear the board
      clearBoard(gameState.board);

      // Place a white pawn one step away from promotion
      placePiece(gameState.board, { col: 4, row: 1 }, { type: PieceType.PAWN, color: Color.WHITE, hasMoved: true });
      switchTurn(gameState);

      // Place a black piece to capture
      placePiece(gameState.board, { col: 3, row: 0 }, { type: PieceType.ROOK, color: Color.BLACK });
      switchTurn(gameState);

      // Move the pawn to capture and promote (e7 to d8)
      const result = movePiece(
        { col: 4, row: 1 }, // e7
        { col: 3, row: 0 }, // d8
        gameState
      );

      expect(result).not.toBeNull();
      if (result) {
        // Original position should be empty
        expect(result.board[1][4]).toBeNull();

        // New position should have a queen (default promotion piece)
        expect(result.board[0][3]).toMatchObject({
          type: PieceType.QUEEN,
          color: Color.WHITE,
          hasMoved: true,
        });

        // Move history should include the promotion and capture
        expect(result.moveHistory[0]).toMatchObject({
          from: { col: 4, row: 1 },
          to: { col: 3, row: 0 },
          piece: { type: PieceType.PAWN, color: Color.WHITE },
          special: 'promotion',
          captured: { type: PieceType.ROOK, color: Color.BLACK },
          promotedTo: PieceType.QUEEN,
        });
      }
    });

    it('should allow custom piece selection for promotion', () => {
      // Set up a board with a pawn close to promotion
      const gameState = createGameState();

      // Clear the board
      clearBoard(gameState.board);

      // Place a white pawn one step away from promotion
      placePiece(gameState.board, { col: 4, row: 1 }, { type: PieceType.PAWN, color: Color.WHITE, hasMoved: true });
      switchTurn(gameState);

      // Move the pawn to the last rank and promote to knight
      const result = movePiece(
        { col: 4, row: 1 }, // e7
        { col: 4, row: 0 }, // e8
        gameState,
        PieceType.KNIGHT // Specify promotion to knight
      );

      expect(result).not.toBeNull();
      if (result) {
        // New position should have a knight
        expect(result.board[0][4]).toMatchObject({
          type: PieceType.KNIGHT,
          color: Color.WHITE,
          hasMoved: true,
        });

        // Move history should include the promotion to knight
        expect(result.moveHistory[0]).toMatchObject({
          from: { col: 4, row: 1 },
          to: { col: 4, row: 0 },
          piece: { type: PieceType.PAWN, color: Color.WHITE },
          special: 'promotion',
          promotedTo: PieceType.KNIGHT,
        });
      }
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
