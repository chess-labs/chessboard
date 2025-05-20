import type { Board, Move, Piece, Position, GameState } from '../types';
import { Color, PieceType } from '../types';
import { getPieceAt, isValidPosition } from '../board';

/**
 * Get all possible moves for a pawn at the given position
 */
export const getPawnMoves = (position: Position, gameState: GameState): Move[] => {
  const { board } = gameState;
  const piece = getPieceAt(position, board);
  if (!piece || piece.type !== PieceType.PAWN) return [];

  const moves: Move[] = [];
  const direction = piece.color === Color.WHITE ? -1 : 1; // White moves up (-y), Black moves down (+y)
  const startingRank = piece.color === Color.WHITE ? 6 : 1;

  // Forward moves
  const forwardMoves = getForwardMoves(position, direction, startingRank, board);
  moves.push(...forwardMoves);

  // Capture moves
  const captureMoves = getCaptureMoves(position, direction, piece.color, board);
  moves.push(...captureMoves);

  // En passant moves
  const enPassantMoves = getEnPassantMoves(position, direction, piece.color, gameState);
  moves.push(...enPassantMoves);

  return moves;
};

/**
 * Get possible forward moves for a pawn
 */
const getForwardMoves = (position: Position, direction: number, startingRank: number, board: Board): Move[] => {
  const moves: Move[] = [];
  const oneSquareForward: Position = { col: position.col, row: position.row + direction };

  // Check one square forward
  if (isValidPosition(oneSquareForward) && !getPieceAt(oneSquareForward, board)) {
    moves.push({
      from: position,
      to: oneSquareForward,
    });

    // Check two squares forward from starting position
    if (position.row === startingRank) {
      const twoSquaresForward: Position = { col: position.col, row: position.row + direction * 2 };
      if (isValidPosition(twoSquaresForward) && !getPieceAt(twoSquaresForward, board)) {
        moves.push({
          from: position,
          to: twoSquaresForward,
          special: 'two-square-advance',
        });
      }
    }
  }

  return moves;
};

/**
 * Get possible capture moves for a pawn
 */
const getCaptureMoves = (position: Position, direction: number, color: Color, board: Board): Move[] => {
  const moves: Move[] = [];
  const capturePositions: Position[] = [
    { col: position.col - 1, row: position.row + direction }, // Left capture
    { col: position.col + 1, row: position.row + direction }, // Right capture
  ];

  for (const capturePos of capturePositions) {
    if (!isValidPosition(capturePos)) continue;

    const targetPiece = getPieceAt(capturePos, board);
    if (targetPiece && targetPiece.color !== color) {
      moves.push({
        from: position,
        to: capturePos,
        capture: true,
      });
    }
  }

  return moves;
};

/**
 * Get possible en passant moves for a pawn
 */
const getEnPassantMoves = (position: Position, direction: number, color: Color, gameState: GameState): Move[] => {
  const moves: Move[] = [];
  const { moveHistory } = gameState;

  // En passant is only possible if there is a previous move
  if (moveHistory.length === 0) return moves;

  const lastMove = moveHistory[moveHistory.length - 1];

  // Check if the last move was a pawn's two-square advance
  if (
    lastMove.piece.type === PieceType.PAWN &&
    lastMove.piece.color !== color &&
    lastMove.special === 'two-square-advance' &&
    Math.abs(lastMove.from.row - lastMove.to.row) === 2 &&
    position.row === lastMove.to.row
  ) {
    // Check if our pawn is adjacent to the opponent's pawn
    const colDiff = lastMove.to.col - position.col;
    if (Math.abs(colDiff) === 1) {
      moves.push({
        from: position,
        to: { col: lastMove.to.col, row: position.row + direction },
        capture: true,
        special: 'en-passant',
        capturedPiecePosition: lastMove.to, // Add this to help with move execution
      });
    }
  }

  return moves;
};

/**
 * Check if a pawn move is valid
 */
export const isValidPawnMove = (from: Position, to: Position, gameState: GameState): boolean => {
  const possibleMoves = getPawnMoves(from, gameState);
  return possibleMoves.some((move) => move.to.col === to.col && move.to.row === to.row);
};
