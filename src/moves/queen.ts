import type { Board, GameState, Move, Position } from '../types';
import { Color, PieceType } from '../types';
import { getPieceAt, isPathClear, isValidPosition } from '../board';

/**
 * Get all possible moves for a queen at the given position.
 * The queen combines the movement of the rook (horizontal/vertical)
 * and the bishop (diagonal).
 */
export const getQueenMoves = (position: Position, gameState: GameState): Move[] => {
  const { board } = gameState;
  const piece = getPieceAt(position, board);
  if (!piece || piece.type !== PieceType.QUEEN) return [];

  const moves: Move[] = [];

  // Directions: horizontal, vertical, and diagonal
  const directions = [
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }, // right
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 }, // down
    { dx: -1, dy: -1 }, // up-left
    { dx: 1, dy: -1 }, // up-right
    { dx: -1, dy: 1 }, // down-left
    { dx: 1, dy: 1 }, // down-right
  ];

  for (const direction of directions) {
    moves.push(...getMovesInDirection(position, direction.dx, direction.dy, piece.color, board));
  }

  return moves;
};

/**
 * Get all moves in a specific direction
 */
const getMovesInDirection = (position: Position, dx: number, dy: number, pieceColor: Color, board: Board): Move[] => {
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

/**
 * Determines whether a queen move is valid based on chess rules.
 *
 * A valid queen move must:
 * - Be either horizontal, vertical, or diagonal.
 * - Have a clear path between the starting and ending positions.
 * - End on an empty square or capture an opponent's piece.
 *
 * @param {Position} from - The starting position of the queen.
 * @param {Position} to - The target position of the queen.
 * @param {GameState} gameState - The current state of the game, including the board and pieces.
 * @returns {boolean} True if the move is valid, false otherwise.
 */
export const isValidQueenMove = (from: Position, to: Position, gameState: GameState): boolean => {
  const { board } = gameState;

  // Basic checks
  const piece = getPieceAt(from, board);
  if (!piece || piece.type !== PieceType.QUEEN) return false;
  if (!isValidPosition(to)) return false;

  // Check if the move is horizontal, vertical, or diagonal
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const isHorizontal = dy === 0 && dx > 0;
  const isVertical = dx === 0 && dy > 0;
  const isDiagonal = dx === dy && dx > 0;

  if (!isHorizontal && !isVertical && !isDiagonal) return false;

  // Check if the path is clear
  if (!isPathClear(from, to, board)) return false;

  // Check if the destination is empty or has an opponent's piece
  const targetPiece = getPieceAt(to, board);
  if (targetPiece && targetPiece.color === piece.color) return false;

  return true;
};
