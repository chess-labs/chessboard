import { describe, it, expect } from 'vitest';
import {
  pieceToFenChar,
  fenCharToPiece,
  boardToFenPieces,
  fenPiecesToBoard,
  gameStateToFen,
  fenToGameState,
  getCastlingRights,
  getEnPassantTarget,
  STARTING_FEN,
} from './fen';
import { Color, PieceType, type GameState } from './types';
import { initGameState } from './game';
import { initBoard } from './board';

describe('FEN Utilities', () => {
  describe('pieceToFenChar', () => {
    it('should convert white pieces to uppercase characters', () => {
      expect(pieceToFenChar({ type: PieceType.KING, color: Color.WHITE })).toBe('K');
      expect(pieceToFenChar({ type: PieceType.QUEEN, color: Color.WHITE })).toBe('Q');
      expect(pieceToFenChar({ type: PieceType.ROOK, color: Color.WHITE })).toBe('R');
      expect(pieceToFenChar({ type: PieceType.BISHOP, color: Color.WHITE })).toBe('B');
      expect(pieceToFenChar({ type: PieceType.KNIGHT, color: Color.WHITE })).toBe('N');
      expect(pieceToFenChar({ type: PieceType.PAWN, color: Color.WHITE })).toBe('P');
    });

    it('should convert black pieces to lowercase characters', () => {
      expect(pieceToFenChar({ type: PieceType.KING, color: Color.BLACK })).toBe('k');
      expect(pieceToFenChar({ type: PieceType.QUEEN, color: Color.BLACK })).toBe('q');
      expect(pieceToFenChar({ type: PieceType.ROOK, color: Color.BLACK })).toBe('r');
      expect(pieceToFenChar({ type: PieceType.BISHOP, color: Color.BLACK })).toBe('b');
      expect(pieceToFenChar({ type: PieceType.KNIGHT, color: Color.BLACK })).toBe('n');
      expect(pieceToFenChar({ type: PieceType.PAWN, color: Color.BLACK })).toBe('p');
    });
  });

  describe('fenCharToPiece', () => {
    it('should convert uppercase characters to white pieces', () => {
      expect(fenCharToPiece('K')).toEqual({ type: PieceType.KING, color: Color.WHITE });
      expect(fenCharToPiece('Q')).toEqual({ type: PieceType.QUEEN, color: Color.WHITE });
      expect(fenCharToPiece('R')).toEqual({ type: PieceType.ROOK, color: Color.WHITE });
      expect(fenCharToPiece('B')).toEqual({ type: PieceType.BISHOP, color: Color.WHITE });
      expect(fenCharToPiece('N')).toEqual({ type: PieceType.KNIGHT, color: Color.WHITE });
      expect(fenCharToPiece('P')).toEqual({ type: PieceType.PAWN, color: Color.WHITE });
    });

    it('should convert lowercase characters to black pieces', () => {
      expect(fenCharToPiece('k')).toEqual({ type: PieceType.KING, color: Color.BLACK });
      expect(fenCharToPiece('q')).toEqual({ type: PieceType.QUEEN, color: Color.BLACK });
      expect(fenCharToPiece('r')).toEqual({ type: PieceType.ROOK, color: Color.BLACK });
      expect(fenCharToPiece('b')).toEqual({ type: PieceType.BISHOP, color: Color.BLACK });
      expect(fenCharToPiece('n')).toEqual({ type: PieceType.KNIGHT, color: Color.BLACK });
      expect(fenCharToPiece('p')).toEqual({ type: PieceType.PAWN, color: Color.BLACK });
    });

    it('should return null for invalid characters', () => {
      expect(fenCharToPiece('x')).toBeNull();
      expect(fenCharToPiece('1')).toBeNull();
      expect(fenCharToPiece(' ')).toBeNull();
      expect(fenCharToPiece('/')).toBeNull();
    });
  });

  describe('boardToFenPieces', () => {
    it('should convert starting position to correct FEN pieces', () => {
      const board = initBoard();
      const fenPieces = boardToFenPieces(board);
      expect(fenPieces).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    });

    it('should handle empty squares correctly', () => {
      const board = initBoard();
      // Clear some pieces to test empty square counting
      board[4][4] = null; // e4
      board[4][5] = null; // f4
      board[4][6] = null; // g4

      const fenPieces = boardToFenPieces(board);
      // Row 4 (5th rank) should show "8" for all empty squares
      expect(fenPieces).toContain('/8/');
    });
  });

  describe('fenPiecesToBoard', () => {
    it('should convert FEN pieces to correct board', () => {
      const fenPieces = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
      const board = fenPiecesToBoard(fenPieces);
      const expectedBoard = initBoard();

      // Compare boards
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          expect(board[row][col]).toEqual(expectedBoard[row][col]);
        }
      }
    });

    it('should handle empty squares correctly', () => {
      const fenPieces = '8/8/8/8/8/8/8/8'; // Empty board
      const board = fenPiecesToBoard(fenPieces);

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          expect(board[row][col]).toBeNull();
        }
      }
    });

    it('should throw error for invalid FEN', () => {
      expect(() => fenPiecesToBoard('invalid')).toThrow('Invalid FEN: must have 8 rows');
    });

    it('should throw error for invalid characters', () => {
      expect(() => fenPiecesToBoard('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNx')).toThrow(
        "Invalid FEN: unrecognized character 'x' in row 8"
      );
    });

    it('should throw error for invalid characters in middle rows', () => {
      expect(() => fenPiecesToBoard('rnbqkbnr/pppppppp/8/4z3/8/8/PPPPPPPP/RNBQKBNR')).toThrow(
        "Invalid FEN: unrecognized character 'z' in row 4"
      );
    });
  });

  describe('getCastlingRights', () => {
    it('should return full castling rights for starting position', () => {
      const gameState = initGameState();
      const rights = getCastlingRights(gameState);
      expect(rights).toBe('KQkq');
    });

    it('should return no rights when king has moved', () => {
      const gameState = initGameState();
      // Mark white king as moved
      if (gameState.board[7][4]) {
        gameState.board[7][4].hasMoved = true;
      }

      const rights = getCastlingRights(gameState);
      expect(rights).toBe('kq'); // Only black castling rights remain
    });

    it('should return "-" when no castling rights remain', () => {
      const gameState = initGameState();
      // Mark all kings and rooks as moved
      const positions = [
        [7, 4], // White king
        [7, 0], // White queenside rook
        [7, 7], // White kingside rook
        [0, 4], // Black king
        [0, 0], // Black queenside rook
        [0, 7], // Black kingside rook
      ];

      for (const [row, col] of positions) {
        const piece = gameState.board[row][col];
        if (piece) {
          piece.hasMoved = true;
        }
      }

      const rights = getCastlingRights(gameState);
      expect(rights).toBe('-');
    });
  });

  describe('getEnPassantTarget', () => {
    it('should return "-" when no en passant is possible', () => {
      const gameState = initGameState();
      const target = getEnPassantTarget(gameState);
      expect(target).toBe('-');
    });

    it('should return correct target after two-square pawn advance', () => {
      const gameState = initGameState();

      // Simulate e2-e4 move
      gameState.moveHistory.push({
        from: { row: 6, col: 4 },
        to: { row: 4, col: 4 },
        piece: { type: PieceType.PAWN, color: Color.WHITE },
        special: 'two-square-advance',
      });

      const target = getEnPassantTarget(gameState);
      expect(target).toBe('e3'); // Square behind the pawn
    });
  });

  describe('gameStateToFen', () => {
    it('should convert starting position to correct FEN', () => {
      const gameState = initGameState();
      const fen = gameStateToFen(gameState);
      expect(fen).toBe(STARTING_FEN);
    });

    it('should handle different game states', () => {
      const gameState = initGameState();
      gameState.currentTurn = Color.BLACK;
      gameState.moveHistory.push({
        from: { row: 6, col: 4 },
        to: { row: 4, col: 4 },
        piece: { type: PieceType.PAWN, color: Color.WHITE },
      });

      const fen = gameStateToFen(gameState);
      expect(fen).toContain(' b '); // Black to move
      expect(fen).toContain(' 1'); // First move completed
    });
  });

  describe('fenToGameState', () => {
    it('should convert starting FEN to correct game state', () => {
      const gameState = fenToGameState(STARTING_FEN);

      expect(gameState.currentTurn).toBe(Color.WHITE);
      expect(gameState.moveHistory).toEqual([]);

      // Check that board is properly set up
      const expectedBoard = initBoard();
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          expect(gameState.board[row][col]).toEqual(expectedBoard[row][col]);
        }
      }
    });

    it('should handle different positions', () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const gameState = fenToGameState(fen);

      expect(gameState.currentTurn).toBe(Color.BLACK);
      expect(gameState.board[4][4]).toEqual({
        // e4 square
        type: PieceType.PAWN,
        color: Color.WHITE,
      });
      expect(gameState.board[6][4]).toBeNull(); // e2 square should be empty
    });

    it('should throw error for invalid FEN', () => {
      expect(() => fenToGameState('invalid fen')).toThrow('Invalid FEN: must have 6 space-separated parts');
    });
  });

  describe('Round-trip conversion', () => {
    it('should maintain consistency between gameStateToFen and fenToGameState', () => {
      const originalGameState = initGameState();
      const fen = gameStateToFen(originalGameState);
      const reconstructedGameState = fenToGameState(fen);

      // Board should be identical
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          expect(reconstructedGameState.board[row][col]).toEqual(originalGameState.board[row][col]);
        }
      }

      // Turn should be identical
      expect(reconstructedGameState.currentTurn).toBe(originalGameState.currentTurn);
    });
  });

  describe('STARTING_FEN constant', () => {
    it('should be valid standard starting position', () => {
      expect(STARTING_FEN).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

      // Should be parseable
      expect(() => fenToGameState(STARTING_FEN)).not.toThrow();
    });
  });
});
