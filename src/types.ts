/**
 * Enumeration defining chess piece types
 */
export enum PieceType {
  PAWN = 'pawn',
  ROOK = 'rook',
  KNIGHT = 'knight',
  BISHOP = 'bishop',
  QUEEN = 'queen',
  KING = 'king',
}

/**
 * Enumeration defining chess piece colors
 */
export enum Color {
  WHITE = 'white',
  BLACK = 'black',
}

/**
 * Interface representing a position on the chess board
 * x: 0-7 (a-h)
 * y: 0-7 (1-8)
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Interface representing a chess piece
 */
export interface Piece {
  type: PieceType;
  color: Color;
  hasMoved?: boolean; // Used for castling, pawn's 2-square move, etc.
}

/**
 * Type representing a chess board
 * Implemented as a 2D array (8x8)
 * null means an empty square
 */
export type Board = Array<Array<Piece | null>>;

/**
 * Type representing a possible move
 */
export interface Move {
  from: Position;
  to: Position;
  capture?: boolean; // Whether this move captures an opponent's piece
  special?: 'castling' | 'en-passant' | 'promotion'; // Special move type
}

/**
 * Interface representing the state of a chess game
 */
export interface GameState {
  board: Board;
  currentTurn: Color;
  moveHistory: Array<{
    from: Position;
    to: Position;
    piece: Piece;
    captured?: Piece;
    special?: 'castling' | 'en-passant' | 'promotion';
  }>;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
}
