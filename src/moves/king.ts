import { type GameState, type Move, type Position, Color, PieceType } from '../types';
import { getPieceAt, isPathClear, cloneBoard, clearPosition, placePiece } from '../board';
import { isPlayerInCheck } from '../game';

/**
 * Returns all possible moves for a king at the given position.
 */
export const getKingMoves = (position: Position, gameState: GameState): Move[] => {
  const { col, row } = position;
  const { board } = gameState;

  const kingPiece = getPieceAt(position, board);

  // If there's no king at the current position, return an empty array
  if (!kingPiece || kingPiece.type !== PieceType.KING) {
    return [];
  }

  const kingColor = kingPiece.color;
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

  // Add castling moves
  if (!kingPiece.hasMoved) {
    // Kingside castling
    const kingsideRookPos = { col: 7, row };
    if (canCastle(position, kingsideRookPos, gameState)) {
      moves.push({
        from: position,
        to: { col: col + 2, row },
        special: 'castling',
      });
    }

    // Queenside castling
    const queensideRookPos = { col: 0, row };
    if (canCastle(position, queensideRookPos, gameState)) {
      moves.push({
        from: position,
        to: { col: col - 2, row },
        special: 'castling',
      });
    }
  }

  return moves;
};

/**
 * Checks if a king move is valid.
 */
export const isValidKingMove = (from: Position, to: Position, gameState: GameState): boolean => {
  const { board } = gameState;

  const kingPiece = getPieceAt(from, board);

  // If there's no king at the source position, the move is invalid
  if (!kingPiece || kingPiece.type !== PieceType.KING) {
    return false;
  }

  // Calculate the distance of the move
  const deltaCol = Math.abs(to.col - from.col);
  const deltaRow = Math.abs(to.row - from.row);

  // Kings can only move one square in any direction
  if (deltaCol > 1 || deltaRow > 1) {
    // Handle castling exception
    if (deltaRow === 0 && deltaCol === 2) {
      // Potential castling move
      const rookCol = to.col > from.col ? 7 : 0;
      const rookPos = { col: rookCol, row: from.row };
      return canCastle(from, rookPos, gameState);
    }
    return false;
  }

  const kingColor = kingPiece.color;
  const targetSquare = board[to.row][to.col];

  // Cannot move to a square occupied by a piece of the same color
  if (targetSquare && targetSquare.color === kingColor) {
    return false;
  }

  // Check if the king would be in check after the move
  // Create a cloned board to simulate the move
  const clonedBoard = cloneBoard(board);

  // First clear the king's current position
  clearPosition(clonedBoard, from);

  // If there's a piece at the target position (capture scenario), clear it first
  if (targetSquare && targetSquare.color !== kingColor) {
    clearPosition(clonedBoard, to);
  }

  // Place the king at the new position
  placePiece(clonedBoard, to, kingPiece);

  // Create a temporary game state with the king moved
  const clonedGameState = { ...gameState, board: clonedBoard };

  // If the king would be in check after the move, it's invalid
  if (isPlayerInCheck(clonedGameState, kingColor)) {
    return false;
  }

  return true;
};

/**
 * Checks if castling is possible between king and rook positions.
 * @param kingPosition The position of the king
 * @param rookPosition The position of the rook
 * @param gameState Current game state
 * @returns True if castling is allowed, false otherwise
 */
export const canCastle = (kingPosition: Position, rookPosition: Position, gameState: GameState): boolean => {
  const { board } = gameState;

  // 1. Check if king and rook are present and have not moved
  const king = getPieceAt(kingPosition, board);
  const rook = getPieceAt(rookPosition, board);

  if (!king || king.type !== PieceType.KING || king.hasMoved) {
    return false;
  }

  if (!rook || rook.type !== PieceType.ROOK || rook.hasMoved) {
    return false;
  }

  // King and rook must be of the same color
  if (king.color !== rook.color) {
    return false;
  }

  // King and rook must be on the same row for castling
  if (kingPosition.row !== rookPosition.row) {
    return false;
  }

  // 2. Check if the king is currently in check
  if (isPlayerInCheck(gameState, king.color)) {
    return false;
  }

  // 3. Check if there are pieces between king and rook
  if (!isPathClear(kingPosition, rookPosition, board)) {
    return false;
  }

  // 4. King cannot pass through or end up on a square that is under attack
  // Determine the path the king will take
  const direction = rookPosition.col > kingPosition.col ? 1 : -1; // 1 for kingside, -1 for queenside

  // Check squares the king passes through
  for (let i = 1; i <= 2; i++) {
    const checkPos = { col: kingPosition.col + direction * i, row: kingPosition.row };

    // Create a cloned gameState with the king on the square being checked
    const clonedBoard = cloneBoard(board);
    clearPosition(clonedBoard, kingPosition);
    placePiece(clonedBoard, checkPos, king);

    const clonedGameState = { ...gameState, board: clonedBoard };

    // Check if this position would put the king in check
    if (isPlayerInCheck(clonedGameState, king.color)) {
      return false;
    }
  }

  return true;
};
