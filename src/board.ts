import { type Board, Color, type Piece, PieceType, type Position } from './types';

/**
 * Initialize an 8x8 chess board for a standard chess game.
 */
export const initBoard = (): Board => {
  // Create an empty 8x8 chess board
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Place pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: PieceType.PAWN, color: Color.BLACK, hasMoved: false };
    board[6][i] = { type: PieceType.PAWN, color: Color.WHITE, hasMoved: false };
  }

  // Place rooks
  board[0][0] = { type: PieceType.ROOK, color: Color.BLACK, hasMoved: false };
  board[0][7] = { type: PieceType.ROOK, color: Color.BLACK, hasMoved: false };
  board[7][0] = { type: PieceType.ROOK, color: Color.WHITE, hasMoved: false };
  board[7][7] = { type: PieceType.ROOK, color: Color.WHITE, hasMoved: false };

  // Place knights
  board[0][1] = { type: PieceType.KNIGHT, color: Color.BLACK };
  board[0][6] = { type: PieceType.KNIGHT, color: Color.BLACK };
  board[7][1] = { type: PieceType.KNIGHT, color: Color.WHITE };
  board[7][6] = { type: PieceType.KNIGHT, color: Color.WHITE };

  // Place bishops
  board[0][2] = { type: PieceType.BISHOP, color: Color.BLACK };
  board[0][5] = { type: PieceType.BISHOP, color: Color.BLACK };
  board[7][2] = { type: PieceType.BISHOP, color: Color.WHITE };
  board[7][5] = { type: PieceType.BISHOP, color: Color.WHITE };

  // Place queens
  board[0][3] = { type: PieceType.QUEEN, color: Color.BLACK };
  board[7][3] = { type: PieceType.QUEEN, color: Color.WHITE };

  // Place kings
  board[0][4] = { type: PieceType.KING, color: Color.BLACK };
  board[7][4] = { type: PieceType.KING, color: Color.WHITE };

  return board;
};

/**
 * Check if the position is within the chess board.
 */
export const isValidPosition = (position: Position): boolean => {
  return position.x >= 0 && position.x < 8 && position.y >= 0 && position.y < 8;
};

/**
 * Return the piece at the specified position.
 * Returns null if the position is invalid or there is no piece.
 */
export const getPieceAt = (position: Position, board: Board): Piece | null => {
  if (!isValidPosition(position)) {
    return null;
  }

  return board[position.y][position.x];
};

/**
 * Check if all positions between two positions (from, to) are empty.
 * Works only on straight paths (horizontal, vertical, diagonal).
 */
export const isPathClear = (from: Position, to: Position, board: Board): boolean => {
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);

  if (dx === 0 && dy === 0) return true; // Same position

  let x = from.x + dx;
  let y = from.y + dy;

  while (x !== to.x || y !== to.y) {
    if (board[y][x] !== null) {
      return false; // There is a piece in the path
    }

    x += dx;
    y += dy;
  }

  return true;
};

/**
 * Convert algebraic notation (e.g., "e4") to coordinates
 */
export const algebraicToPosition = (algebraic: string): Position => {
  if (!/^[a-h][1-8]$/.test(algebraic)) {
    throw new Error('Invalid algebraic notation. Expected format like "e4".');
  }

  const file = algebraic.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = 8 - Number.parseInt(algebraic[1], 10);

  return { x: file, y: rank };
};

/**
 * Convert coordinates to algebraic notation
 */
export const positionToAlgebraic = (position: Position): string => {
  // Validate that the position is within bounds
  if (!isValidPosition(position)) {
    throw new Error('Invalid position. Coordinates must be between 0 and 7.');
  }

  const file = String.fromCharCode('a'.charCodeAt(0) + position.x);
  const rank = 8 - position.y;

  return `${file}${rank}`;
};
