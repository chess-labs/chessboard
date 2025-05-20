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
    { deltaCol: -1, deltaRow: 0 }, // left
    { deltaCol: 1, deltaRow: 0 }, // right
    { deltaCol: 0, deltaRow: -1 }, // up
    { deltaCol: 0, deltaRow: 1 }, // down
    { deltaCol: -1, deltaRow: -1 }, // up-left
    { deltaCol: 1, deltaRow: -1 }, // up-right
    { deltaCol: -1, deltaRow: 1 }, // down-left
    { deltaCol: 1, deltaRow: 1 }, // down-right
  ];

  for (const direction of directions) {
    moves.push(...getMovesInDirection(position, direction.deltaCol, direction.deltaRow, piece.color, board));
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
  const deltaCol = Math.abs(to.col - from.col);
  const deltaRow = Math.abs(to.row - from.row);
  const isHorizontal = deltaRow === 0 && deltaCol > 0;
  const isVertical = deltaCol === 0 && deltaRow > 0;
  const isDiagonal = deltaCol === deltaRow && deltaCol > 0;

  if (!isHorizontal && !isVertical && !isDiagonal) return false;

  return (
    isPathClear(from, to, board) && (getPieceAt(to, board) === null || getPieceAt(to, board)?.color !== piece.color)
  );
};

/**
 * Get all moves in a specific direction
 */
export const getMovesInDirection = (
  position: Position,
  deltaCol: number,
  deltaRow: number,
  pieceColor: Color,
  board: Board
): Move[] => {
  const moves: Move[] = [];
  let currentCol = position.col + deltaCol;
  let currentRow = position.row + deltaRow;
  while (true) {
    // Check if position is valid (within board)
    if (!isValidPosition({ col: currentCol, row: currentRow })) break;
    const targetPosition: Position = { col: currentCol, row: currentRow };
    const targetPiece = getPieceAt(targetPosition, board);
    if (targetPiece === null) {
      // Empty square - can move here
      moves.push({
        from: position,
        to: targetPosition,
        capture: false,
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
    currentCol += deltaCol;
    currentRow += deltaRow;
  }
  return moves;
};
