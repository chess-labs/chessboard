import type { GameState, Move, Position } from '../types';
import { Color, PieceType } from '../types';

/**
 * Returns all possible moves for a king at the given position.
 */
export const getKingMoves = (position: Position, gameState: GameState): Move[] => {
  const { col, row } = position;
  const { board } = gameState;

  // If there's no king at the current position, return an empty array
  if (!board[row]?.[col] || board[row][col]?.type !== PieceType.KING) {
    return [];
  }

  const kingColor = board[row][col]?.color as Color;
  const moves: Move[] = [];

  // Kings can move one square in any direction (8 directions)
  const directions = [
    { deltaCol: -1, deltaRow: -1 }, // top-left
    { deltaCol: 0, deltaRow: -1 }, // top
    { deltaCol: 1, deltaRow: -1 }, // top-right
    { deltaCol: -1, deltaRow: 0 }, // left
    { deltaCol: 1, deltaRow: 0 }, // right
    { deltaCol: -1, deltaRow: 1 }, // bottom-left
    { deltaCol: 0, deltaRow: 1 }, // bottom
    { deltaCol: 1, deltaRow: 1 }, // bottom-right
  ];

  for (const { deltaCol, deltaRow } of directions) {
    const newCol = col + deltaCol;
    const newRow = row + deltaRow;

    // Check board boundaries
    if (newCol < 0 || newCol > 7 || newRow < 0 || newRow > 7) {
      continue;
    }

    const targetSquare = board[newRow][newCol];

    // Can move to empty squares or capture opponent pieces
    if (!targetSquare || targetSquare.color !== kingColor) {
      const move: Move = {
        from: { col, row },
        to: { col: newCol, row: newRow },
      };

      // If there's an opponent piece, it's a capture
      if (targetSquare && targetSquare.color !== kingColor) {
        move.capture = true;
      }

      moves.push(move);
    }
  }

  // TODO: Implement castling
  // Castling conditions:
  // 1. The king has not moved yet
  // 2. The involved rook has not moved yet
  // 3. There are no pieces between the king and the rook
  // 4. The king is not in check
  // 5. The squares the king traverses are not under attack

  // Castling logic will be added here

  return moves;
};

/**
 * Checks if a king move is valid.
 */
export const isValidKingMove = (from: Position, to: Position, gameState: GameState): boolean => {
  const { board } = gameState;

  // If there's no king at the source position, the move is invalid
  if (!board[from.row]?.[from.col] || board[from.row][from.col]?.type !== PieceType.KING) {
    return false;
  }

  // Calculate the distance of the move
  const deltaCol = Math.abs(to.col - from.col);
  const deltaRow = Math.abs(to.row - from.row);

  // Kings can only move one square in any direction
  if (deltaCol > 1 || deltaRow > 1) {
    // TODO: Handle castling exception
    return false;
  }

  const kingColor = board[from.row][from.col]?.color as Color;
  const targetSquare = board[to.row][to.col];

  // Cannot move to a square occupied by a piece of the same color
  if (targetSquare && targetSquare.color === kingColor) {
    return false;
  }

  return true;
};

/**
 * Checks if castling is possible.
 * (Placeholder function)
 */
export const canCastle = (kingPosition: Position, rookPosition: Position, gameState: GameState): boolean => {
  // TODO: Implement castling conditions check
  // 1. The king and rook have not moved
  // 2. There are no pieces between the king and the rook
  // 3. The king is not in check
  // 4. The squares the king traverses are not under attack
  return false;
};
