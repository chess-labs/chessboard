import type { Position, GameState, Move } from '../types';
import { PieceType } from '../types';
import { getPieceAt, isValidPosition, isPathClear } from '../board';

/**
 * Calculates all possible moves for a bishop.
 * Bishops move diagonally and are blocked by other pieces.
 */
export const getBishopMoves = (from: Position, gameState: GameState): Move[] => {
  const piece = getPieceAt(from, gameState.board);

  // Check if there is a bishop at the position
  if (!piece || piece.type !== PieceType.BISHOP) {
    return [];
  }

  const moves: Move[] = [];
  const directions = [
    { x: 1, y: 1 }, // down-right
    { x: 1, y: -1 }, // up-right
    { x: -1, y: 1 }, // down-left
    { x: -1, y: -1 }, // up-left
  ];

  // Check each diagonal direction
  for (const dir of directions) {
    let currentPos: Position = { x: from.x, y: from.y };

    // Move in the current direction until reaching the edge or a piece
    while (true) {
      currentPos = { x: currentPos.x + dir.x, y: currentPos.y + dir.y };

      // Stop if position is outside the board
      if (!isValidPosition(currentPos)) {
        break;
      }

      const targetPiece = getPieceAt(currentPos, gameState.board);

      // If there's a piece of the same color, can't move here
      if (targetPiece && targetPiece.color === piece.color) {
        break;
      }

      // Add the move (with capture flag if there's an opponent's piece)
      const move: Move = {
        from,
        to: { ...currentPos },
        capture: targetPiece !== null,
      };

      moves.push(move);

      // Stop after capturing an opponent's piece
      if (targetPiece) {
        break;
      }
    }
  }

  return moves;
};

/**
 * Checks if a move from source to destination position is valid for a bishop.
 * Bishops move diagonally and are blocked by pieces in their path.
 */
export const isValidBishopMove = (from: Position, to: Position, gameState: GameState): boolean => {
  const piece = getPieceAt(from, gameState.board);

  // Check if there is a bishop at the from position
  if (!piece || piece.type !== PieceType.BISHOP) {
    return false;
  }

  // Check if destination is occupied by a piece of the same color
  const destPiece = getPieceAt(to, gameState.board);
  if (destPiece && destPiece.color === piece.color) {
    return false;
  }

  // Check if the move is diagonal
  const xDiff = Math.abs(to.x - from.x);
  const yDiff = Math.abs(to.y - from.y);

  // Bishop moves diagonally (x and y differences must be equal)
  if (xDiff !== yDiff) {
    return false;
  }

  // Check if the path is clear
  return isPathClear(from, to, gameState.board);
};
