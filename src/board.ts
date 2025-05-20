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
  for (let col = 0; col < 8; col++) {
    placePiece(board, { col, row: 1 }, { type: PieceType.PAWN, color: Color.BLACK });
    placePiece(board, { col, row: 6 }, { type: PieceType.PAWN, color: Color.WHITE });
  }

  // Place rooks
  placePiece(board, { col: 0, row: 0 }, { type: PieceType.ROOK, color: Color.BLACK });
  placePiece(board, { col: 7, row: 0 }, { type: PieceType.ROOK, color: Color.BLACK });
  placePiece(board, { col: 0, row: 7 }, { type: PieceType.ROOK, color: Color.WHITE });
  placePiece(board, { col: 7, row: 7 }, { type: PieceType.ROOK, color: Color.WHITE });

  // Place knights
  placePiece(board, { col: 1, row: 0 }, { type: PieceType.KNIGHT, color: Color.BLACK });
  placePiece(board, { col: 6, row: 0 }, { type: PieceType.KNIGHT, color: Color.BLACK });
  placePiece(board, { col: 1, row: 7 }, { type: PieceType.KNIGHT, color: Color.WHITE });
  placePiece(board, { col: 6, row: 7 }, { type: PieceType.KNIGHT, color: Color.WHITE });

  // Place bishops
  placePiece(board, { col: 2, row: 0 }, { type: PieceType.BISHOP, color: Color.BLACK });
  placePiece(board, { col: 5, row: 0 }, { type: PieceType.BISHOP, color: Color.BLACK });
  placePiece(board, { col: 2, row: 7 }, { type: PieceType.BISHOP, color: Color.WHITE });
  placePiece(board, { col: 5, row: 7 }, { type: PieceType.BISHOP, color: Color.WHITE });

  // Place queens
  placePiece(board, { col: 3, row: 0 }, { type: PieceType.QUEEN, color: Color.BLACK });
  placePiece(board, { col: 3, row: 7 }, { type: PieceType.QUEEN, color: Color.WHITE });

  // Place kings
  placePiece(board, { col: 4, row: 0 }, { type: PieceType.KING, color: Color.BLACK });
  placePiece(board, { col: 4, row: 7 }, { type: PieceType.KING, color: Color.WHITE });

  return board;
};

/**
 * Check if the position is within the chess board.
 */
export const isValidPosition = (position: Position): boolean => {
  return position.col >= 0 && position.col < 8 && position.row >= 0 && position.row < 8;
};

/**
 * Return the piece at the specified position.
 * Returns null if the position is invalid or there is no piece.
 */
export const getPieceAt = (position: Position, board: Board): Piece | null => {
  if (!isValidPosition(position)) {
    return null;
  }

  return board[position.row][position.col];
};

/**
 * Place a piece at the specified position on the board.
 * Returns true if successful, false if the position is invalid.
 */
export const placePiece = (board: Board, position: Position, piece: Piece): boolean => {
  if (!isValidPosition(position)) {
    return false;
  }

  board[position.row][position.col] = piece;
  return true;
};

/**
 * Remove a piece from the specified position on the board.
 * Returns the removed piece if successful, null if the position is invalid or empty.
 */
export const removePiece = (board: Board, position: Position): Piece | null => {
  if (!isValidPosition(position)) {
    return null;
  }

  const piece = board[position.row][position.col];
  board[position.row][position.col] = null;
  return piece;
};

/**
 * Move a piece from one position to another.
 * Returns the captured piece (if any) or true if the move was successful,
 * false if the source position is invalid or empty.
 */
export const movePiece = (board: Board, from: Position, to: Position): Piece | boolean => {
  const piece = getPieceAt(from, board);
  if (!piece || !isValidPosition(to)) {
    return false;
  }

  const capturedPiece = removePiece(board, to);
  removePiece(board, from);
  placePiece(board, to, piece);

  return capturedPiece || true;
};

/**
 * Clear a position on the board by setting it to null.
 * Returns true if successful, false if the position is invalid.
 */
export const clearPosition = (board: Board, position: Position): boolean => {
  if (!isValidPosition(position)) {
    return false;
  }

  board[position.row][position.col] = null;
  return true;
};

/**
 * Check if all positions between two positions (from, to) are empty.
 * Works only on straight paths (horizontal, vertical, diagonal).
 */
export const isPathClear = (from: Position, to: Position, board: Board): boolean => {
  const deltaCol = Math.sign(to.col - from.col);
  const deltaRow = Math.sign(to.row - from.row);

  if (deltaCol === 0 && deltaRow === 0) return true; // Same position

  // Validate that the path is straight (horizontal, vertical, or diagonal)
  const xDiff = Math.abs(to.col - from.col);
  const yDiff = Math.abs(to.row - from.row);
  const isStraightPath = deltaCol === 0 || deltaRow === 0 || xDiff === yDiff;
  if (!isStraightPath) {
    throw new Error('Path must be straight (horizontal, vertical, or diagonal)');
  }

  let col = from.col + deltaCol;
  let row = from.row + deltaRow;

  while (col !== to.col || row !== to.row) {
    if (board[row][col] !== null) {
      return false; // There is a piece in the path
    }

    col += deltaCol;
    row += deltaRow;
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

  return { col: file, row: rank };
};

/**
 * Clone a chess board deeply to avoid reference issues.
 * This creates a completely new copy of the board with all pieces.
 */
export const cloneBoard = (board: Board): Board => {
  return board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
};

/**
 * Convert coordinates to algebraic notation
 */
export const positionToAlgebraic = (position: Position): string => {
  // Validate that the position is within bounds
  if (!isValidPosition(position)) {
    throw new Error('Invalid position. Coordinates must be between 0 and 7.');
  }

  const file = String.fromCharCode('a'.charCodeAt(0) + position.col);
  const rank = 8 - position.row;

  return `${file}${rank}`;
};
