import type { Board, Color, Move, Position } from './types';
import { getPieceAt, isValidPosition } from './board';

/**
 * Get all moves in a specific direction
 */
export const getMovesInDirection = (
  position: Position,
  dx: number,
  dy: number,
  pieceColor: Color,
  board: Board
): Move[] => {
  const moves: Move[] = [];
  let currentX = position.x + dx;
  let currentY = position.y + dy;
  while (true) {
    // Check if position is valid (within board)
    if (!isValidPosition({ x: currentX, y: currentY })) break;
    const targetPosition: Position = { x: currentX, y: currentY };
    const targetPiece = getPieceAt(targetPosition, board);
    if (targetPiece === null) {
      // Empty square - can move here
      moves.push({
        from: position,
        to: targetPosition,
      });
    } else {
      // Square has a piece
      if (targetPiece.color !== pieceColor) {
        // Opponent's piece - can capture
        moves.push({
          from: position,
          to: targetPosition,
          capture: true,
        });
      }
      // Either way, can't move further in this direction
      break;
    }
    currentX += dx;
    currentY += dy;
  }
  return moves;
};
