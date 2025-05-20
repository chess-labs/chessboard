import type { Position, GameState } from '../types';
import { PieceType } from '../types';
import { getPieceAt } from '../board';

/**
 * Calculates all possible moves for a knight.
 * Knight moves in an L-shape and can jump over other pieces.
 */
export const getKnightMoves = (position: Position): Position[] => {
  const { col, row } = position;

  // 8 possible L-shaped movement patterns for a knight
  const possibleMoves = [
    { col: col - 2, row: row - 1 },
    { col: col - 2, row: row + 1 },
    { col: col - 1, row: row - 2 },
    { col: col - 1, row: row + 2 },
    { col: col + 1, row: row - 2 },
    { col: col + 1, row: row + 2 },
    { col: col + 2, row: row - 1 },
    { col: col + 2, row: row + 1 },
  ];

  // Filter for moves within the chessboard range (0-7)
  return possibleMoves.filter((move) => move.col >= 0 && move.col <= 7 && move.row >= 0 && move.row <= 7);
};

/**
 * Checks if a move from source to destination position is valid for a knight.
 * Knights move in an L-shape (2 squares in one direction and then 1 square perpendicular)
 * and can jump over other pieces.
 */
export const isValidKnightMove = (from: Position, to: Position, gameState: GameState): boolean => {
  // 1. Check if there is a knight at the from position
  const piece = getPieceAt(from, gameState.board);
  if (!piece || piece.type !== PieceType.KNIGHT) {
    return false;
  }

  // 2. Check if destination is occupied by a piece of the same color
  const destPiece = getPieceAt(to, gameState.board);
  if (destPiece && destPiece.color === piece.color) {
    return false;
  }

  // 3. Check if the move is an L-shape (2 squares in one direction and 1 in perpendicular)
  const colDiff = Math.abs(to.col - from.col);
  const rowDiff = Math.abs(to.row - from.row);
  const isLShape = (colDiff === 2 && rowDiff === 1) || (colDiff === 1 && rowDiff === 2);

  if (!isLShape) {
    return false;
  }

  return true;
};
