import { expect, describe, it } from 'vitest';
import {
  movePiece,
  isValidMove,
  initGameState,
  switchTurn,
  addMoveToHistory,
  getCurrentPlayer,
  getMoveHistory,
  isPlayerInCheck,
  updateGameStatus,
  isCheckmate,
  isStalemate,
} from './game';
import { clearBoard, clearPosition, initBoard, placePiece } from './board';
import { Color, PieceType, type GameState, type Position } from './types';
import { getLegalMoves } from './moves';

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

  describe('Special game rules', () => {
    it('should prevent moving when it is not your turn', () => {
      const gameState = createGameState(); // White's turn initially

      // Try to move black pawn - should fail
      const result = movePiece(
        { col: 4, row: 1 }, // e7 (black pawn)
        { col: 4, row: 3 }, // e5
        gameState
      );

      expect(result).toBeNull();
    });

    it('should correctly handle invalid promotion type by falling back to queen', () => {
      const gameState = createGameState();

      // Clear the board
      clearBoard(gameState.board);

      // Place a white pawn one step away from promotion
      placePiece(gameState.board, { col: 4, row: 1 }, { type: PieceType.PAWN, color: Color.WHITE, hasMoved: true });
      gameState.currentTurn = Color.WHITE;

      // Try to promote to an invalid piece type (king)
      const result = movePiece(
        { col: 4, row: 1 },
        { col: 4, row: 0 },
        gameState,
        PieceType.KING // Invalid promotion type
      );

      expect(result).not.toBeNull();
      if (result) {
        // Should be promoted to a queen (default) instead of king
        expect(result.board[0][4]).toMatchObject({
          type: PieceType.QUEEN, // Not KING
          color: Color.WHITE,
        });
      }
    });

    it('should prevent moves that would put own king in check', () => {
      const gameState = createGameState();
      // Clear the board
      clearBoard(gameState.board);

      // Situation where if the bishop moves, the rook can attack the king in a straight line
      placePiece(gameState.board, { col: 4, row: 7 }, { type: PieceType.KING, color: Color.WHITE });
      placePiece(gameState.board, { col: 3, row: 6 }, { type: PieceType.BISHOP, color: Color.WHITE }); // Bishop position
      placePiece(gameState.board, { col: 4, row: 0 }, { type: PieceType.ROOK, color: Color.BLACK });

      gameState.currentTurn = Color.WHITE;

      // If the bishop moves sideways, the rook can attack the king
      const result = movePiece(
        { col: 3, row: 6 }, // bishop
        { col: 2, row: 5 }, // diagonal move
        gameState
      );

      // The move should be rejected (return null)
      expect(result).toBeNull();
    });

    // This test is modified because check state detection is not supported in the current implementation
    it('should detect check state', () => {
      const gameState = createGameState();

      // Clear the board
      clearBoard(gameState.board);

      // Set up a simpler check situation
      placePiece(gameState.board, { col: 4, row: 7 }, { type: PieceType.KING, color: Color.WHITE });
      placePiece(gameState.board, { col: 4, row: 0 }, { type: PieceType.QUEEN, color: Color.BLACK });

      // Verify check state
      const isInCheck = isPlayerInCheck(gameState, Color.WHITE);
      expect(isInCheck).toBe(true);

      // Verify game state update
      const updatedState = updateGameStatus({
        ...gameState,
        currentTurn: Color.WHITE,
      });
      expect(updatedState.isCheck).toBe(true);
    });

    // This test is modified because checkmate detection is not supported in the current implementation
    it('should detect checkmate', () => {
      const gameState = createGameState();

      // Clear the board
      clearBoard(gameState.board);

      // Set up a clearer checkmate situation
      // Situation where the king is in the corner, the queen is directly attacking, and there's no escape
      placePiece(gameState.board, { col: 0, row: 0 }, { type: PieceType.KING, color: Color.WHITE }); // King at a8
      placePiece(gameState.board, { col: 1, row: 0 }, { type: PieceType.QUEEN, color: Color.BLACK }); // Queen at c8
      placePiece(gameState.board, { col: 1, row: 2 }, { type: PieceType.ROOK, color: Color.BLACK }); // Rook at b6

      // Set current turn to WHITE (the player in checkmate)
      gameState.currentTurn = Color.WHITE;

      // Verify checkmate state
      const isInCheckmate = isCheckmate(gameState, Color.WHITE);
      expect(isInCheckmate).toBe(true);

      // Verify game state update
      const updatedState = updateGameStatus({
        ...gameState,
        currentTurn: Color.WHITE,
      });

      expect(updatedState.isCheck).toBe(true);
      expect(updatedState.isCheckmate).toBe(true);
    });

    it('should correctly detect stalemate', () => {
      const gameState = createGameState();

      // Clear the board
      clearBoard(gameState.board);

      // 명확한 스테일메이트 상황 설정: 흑 킹은 h8에 있고 움직일 수 없음
      placePiece(gameState.board, { col: 7, row: 0 }, { type: PieceType.KING, color: Color.BLACK });

      // 백 퀸은 f7에 위치하여 g8과 g7을 통제
      placePiece(gameState.board, { col: 5, row: 1 }, { type: PieceType.QUEEN, color: Color.WHITE });

      // 백 룩은 a8에 위치하여 h8 옆의 h7을 통제
      placePiece(gameState.board, { col: 0, row: 2 }, { type: PieceType.ROOK, color: Color.WHITE });

      // Black's turn
      gameState.currentTurn = Color.BLACK;

      // In this situation, the black king is not in check but has no legal moves (stalemate)
      const isInCheck = isPlayerInCheck(gameState, Color.BLACK);
      expect(isInCheck).toBe(false); // Not in check

      expect(isStalemate(gameState, Color.BLACK)).toBe(true);

      // Update game status and check if stalemate is detected
      const updatedState = updateGameStatus(gameState);
      expect(updatedState.isStalemate).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle moves to non-existent positions gracefully', () => {
      const gameState = createGameState();

      // Try to move to a position outside the board
      const result = movePiece(
        { col: 0, row: 6 }, // a2 pawn
        { col: -1, row: 5 }, // out of bounds
        gameState
      );

      expect(result).toBeNull();
    });

    it('should handle moving a non-existent piece gracefully', () => {
      const gameState = createGameState();

      // Clear a position
      clearPosition(gameState.board, { col: 0, row: 6 });

      // Try to move from an empty square
      const result = movePiece(
        { col: 0, row: 6 }, // empty square
        { col: 0, row: 5 },
        gameState
      );

      expect(result).toBeNull();
    });
  });

  describe('Special moves', () => {
    it('should correctly handle kingside castling', () => {
      const gameState = createGameState();

      // Clear the board
      clearBoard(gameState.board);

      // Place pieces for castling
      // King at e1
      placePiece(gameState.board, { col: 4, row: 7 }, { type: PieceType.KING, color: Color.WHITE });
      // Rook at h1
      placePiece(gameState.board, { col: 7, row: 7 }, { type: PieceType.ROOK, color: Color.WHITE });

      // White's turn
      gameState.currentTurn = Color.WHITE;

      // Perform kingside castling
      const result = movePiece(
        { col: 4, row: 7 }, // e1
        { col: 6, row: 7 }, // g1
        gameState
      );

      expect(result).not.toBeNull();
      if (result) {
        // King should be at g1
        expect(result.board[7][6]).toMatchObject({
          type: PieceType.KING,
          color: Color.WHITE,
        });

        // Rook should be at f1
        expect(result.board[7][5]).toMatchObject({
          type: PieceType.ROOK,
          color: Color.WHITE,
        });

        // Original positions should be empty
        expect(result.board[7][4]).toBeNull(); // e1
        expect(result.board[7][7]).toBeNull(); // h1

        // Move history should include castling
        expect(result.moveHistory[0]).toMatchObject({
          special: 'castling',
        });
      }
    });

    it('should correctly handle queenside castling', () => {
      const gameState = createGameState();

      // Clear the board
      clearBoard(gameState.board);

      // Place pieces for castling
      // King at e1
      placePiece(gameState.board, { col: 4, row: 7 }, { type: PieceType.KING, color: Color.WHITE });
      // Rook at a1
      placePiece(gameState.board, { col: 0, row: 7 }, { type: PieceType.ROOK, color: Color.WHITE });

      // White's turn
      gameState.currentTurn = Color.WHITE;

      // Perform queenside castling
      const result = movePiece(
        { col: 4, row: 7 }, // e1
        { col: 2, row: 7 }, // c1
        gameState
      );

      expect(result).not.toBeNull();
      if (result) {
        // King should be at c1
        expect(result.board[7][2]).toMatchObject({
          type: PieceType.KING,
          color: Color.WHITE,
        });

        // Rook should be at d1
        expect(result.board[7][3]).toMatchObject({
          type: PieceType.ROOK,
          color: Color.WHITE,
        });

        // Original positions should be empty
        expect(result.board[7][4]).toBeNull(); // e1
        expect(result.board[7][0]).toBeNull(); // a1

        // Move history should include castling
        expect(result.moveHistory[0]).toMatchObject({
          special: 'castling',
        });
      }
    });

    it('should not allow castling when king has already moved', () => {
      const gameState = createGameState();

      // Clear the board
      clearBoard(gameState.board);

      // Place pieces for castling
      // King at e1 with hasMoved flag
      placePiece(gameState.board, { col: 4, row: 7 }, { type: PieceType.KING, color: Color.WHITE, hasMoved: true });
      // Rook at h1
      placePiece(gameState.board, { col: 7, row: 7 }, { type: PieceType.ROOK, color: Color.WHITE });

      // White's turn
      gameState.currentTurn = Color.WHITE;

      // Try to castle
      const result = movePiece(
        { col: 4, row: 7 }, // e1
        { col: 6, row: 7 }, // g1
        gameState
      );

      // Castling should not be allowed
      expect(result).toBeNull();
    });

    it('should not allow castling when rook has already moved', () => {
      const gameState = createGameState();

      // Clear the board
      clearBoard(gameState.board);

      // Place pieces for castling
      // King at e1
      placePiece(gameState.board, { col: 4, row: 7 }, { type: PieceType.KING, color: Color.WHITE });
      // Rook at h1 with hasMoved flag
      placePiece(gameState.board, { col: 7, row: 7 }, { type: PieceType.ROOK, color: Color.WHITE, hasMoved: true });

      // White's turn
      gameState.currentTurn = Color.WHITE;

      // Try to castle
      const result = movePiece(
        { col: 4, row: 7 }, // e1
        { col: 6, row: 7 }, // g1
        gameState
      );

      // Castling should not be allowed
      expect(result).toBeNull();
    });

    it('should not allow castling when pieces are between king and rook', () => {
      const gameState = createGameState();

      // Clear the board
      clearBoard(gameState.board);

      // Place pieces for castling
      // King at e1
      placePiece(gameState.board, { col: 4, row: 7 }, { type: PieceType.KING, color: Color.WHITE });
      // Rook at h1
      placePiece(gameState.board, { col: 7, row: 7 }, { type: PieceType.ROOK, color: Color.WHITE });
      // Bishop at f1 (blocking)
      placePiece(gameState.board, { col: 5, row: 7 }, { type: PieceType.BISHOP, color: Color.WHITE });

      // White's turn
      gameState.currentTurn = Color.WHITE;

      // Try to castle
      const result = movePiece(
        { col: 4, row: 7 }, // e1
        { col: 6, row: 7 }, // g1
        gameState
      );

      // Castling should not be allowed
      expect(result).toBeNull();
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
