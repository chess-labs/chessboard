import type { Position, GameState } from '../types';
import { PieceType } from '../types';
import { getPieceAt } from '../board';

/**
 * Calculates all possible moves for a knight.
 * Knight moves in an L-shape and can jump over other pieces.
 */
export const getKnightMoves = (position: Position): Position[] => {
  const { x, y } = position;

  // 8 possible L-shaped movement patterns for a knight
  const possibleMoves = [
    { x: x - 2, y: y - 1 },
    { x: x - 2, y: y + 1 },
    { x: x - 1, y: y - 2 },
    { x: x - 1, y: y + 2 },
    { x: x + 1, y: y - 2 },
    { x: x + 1, y: y + 2 },
    { x: x + 2, y: y - 1 },
    { x: x + 2, y: y + 1 },
  ];

  // Filter for moves within the chessboard range (0-7)
  return possibleMoves.filter((move) => move.x >= 0 && move.x <= 7 && move.y >= 0 && move.y <= 7);
};

/**
 * Checks if a move from source to destination position is valid for a knight.
 * Knights move in an L-shape (2 squares in one direction and then 1 square perpendicular)
 * and can jump over other pieces.
 */
export const isValidKnightMove = (from: Position, to: Position, gameState: GameState): boolean => {
  const piece = getPieceAt(from, gameState.board);

  // Check if there is a knight at the from position
  if (!piece || piece.type !== PieceType.KNIGHT) {
    return false;
  }

  // Check if destination is occupied by a piece of the same color
  const destPiece = getPieceAt(to, gameState.board);
  if (destPiece && destPiece.color === piece.color) {
    return false;
  }

  // Check if the move is an L-shape (2 squares in one direction and 1 in perpendicular)
  const xDiff = Math.abs(to.x - from.x);
  const yDiff = Math.abs(to.y - from.y);

  // Knight moves 2 in one direction and 1 in the other (L shape)
  return (xDiff === 2 && yDiff === 1) || (xDiff === 1 && yDiff === 2);
};
