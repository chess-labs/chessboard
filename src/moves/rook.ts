import type { Board, GameState, Move, Position } from '../types';
import { Color, PieceType } from '../types';
import { getPieceAt, isPathClear, isValidPosition } from '../board';

/**
 * Get all possible moves for a rook at the given position
 */
export const getRookMoves = (position: Position, gameState: GameState): Move[] => {
  const { board } = gameState;
  const piece = getPieceAt(position, board);
  if (!piece || piece.type !== PieceType.ROOK) return [];

  const moves: Move[] = [];

  // Directions: horizontal (left, right) and vertical (up, down)
  const directions = [
    { deltaCol: -1, deltaRow: 0 }, // left
    { deltaCol: 1, deltaRow: 0 }, // right
    { deltaCol: 0, deltaRow: -1 }, // up
    { deltaCol: 0, deltaRow: 1 }, // down
  ];

  for (const direction of directions) {
    moves.push(...getMovesInDirection(position, direction.deltaCol, direction.deltaRow, piece.color, board));
  }

  return moves;
};

/**
 * Determines whether a rook move is valid based on chess rules.
 *
 * A valid rook move must:
 * - Be either horizontal or vertical (not diagonal).
 * - Have a clear path between the starting and ending positions.
 * - End on an empty square or capture an opponent's piece.
 *
 * @param {Position} from - The starting position of the rook.
 * @param {Position} to - The target position of the rook.
 * @param {GameState} gameState - The current state of the game, including the board and pieces.
 * @returns {boolean} True if the move is valid, false otherwise.
 */
export const isValidRookMove = (from: Position, to: Position, gameState: GameState): boolean => {
  const { board } = gameState;

  // Basic checks
  const piece = getPieceAt(from, board);
  if (!piece || piece.type !== PieceType.ROOK) return false;
  if (!isValidPosition(to)) return false;

  // Check if the move is horizontal or vertical
  const isHorizontal = from.row === to.row && from.col !== to.col;
  const isVertical = from.col === to.col && from.row !== to.row;
  if (!isHorizontal && !isVertical) return false;

  // Check if the path is clear
  if (!isPathClear(from, to, board)) return false;

  // Check if the destination is empty or has an opponent's piece
  const targetPiece = getPieceAt(to, board);
  if (targetPiece && targetPiece.color === piece.color) return false;

  return true;
};

/**
 * Get all moves in a specific direction
 */
const getMovesInDirection = (
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
