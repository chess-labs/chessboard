import type { GameState, Move, Position } from '../types';
import { PieceType } from '../types';
import { getPieceAt, isValidPosition } from '../board';
import { getPawnMoves } from './pawn';
import { getRookMoves } from './rook';
import { getKnightMoves } from './knight';
import { getBishopMoves } from './bishop';
import { getQueenMoves } from './queen';
import { getKingMoves } from './king';

/**
 * Returns all legal moves for the piece at the given position.
 * This function acts as a dispatcher that routes to piece-specific movement logic.
 *
 * @param position The position of the piece
 * @param gameState The current game state
 * @returns An array of legal moves for the piece
 */
export const getLegalMoves = (position: Position, gameState: GameState): Move[] => {
  // Check if position is valid
  if (!isValidPosition(position)) {
    return [];
  }

  // Get the piece at the position
  const piece = getPieceAt(position, gameState.board);

  // If there's no piece at the position, return empty array
  if (!piece) {
    return [];
  }

  // Check if it's the piece's turn
  if (piece.color !== gameState.currentTurn) {
    return [];
  }

  // Dispatch to the appropriate piece-specific function based on the piece type
  switch (piece.type) {
    case PieceType.PAWN:
      return getPawnMoves(position, gameState);

    case PieceType.ROOK:
      return getRookMoves(position, gameState);

    case PieceType.KNIGHT: {
      // Knight has a different function signature, so we need to adapt it
      const knightPositions = getKnightMoves(position);

      // Convert positions to moves and filter friendly fire
      return knightPositions.flatMap((to) => {
        const targetPiece = getPieceAt(to, gameState.board);

        // Don't allow capturing own pieces
        if (targetPiece && targetPiece.color === piece.color) {
          return [];
        }

        return [
          {
            from: position,
            to,
            capture: targetPiece !== null,
          },
        ];
      });
    }

    case PieceType.BISHOP:
      return getBishopMoves(position, gameState);

    case PieceType.QUEEN:
      return getQueenMoves(position, gameState);

    case PieceType.KING:
      return getKingMoves(position, gameState);

    default:
      console.error(`Unknown piece type: ${piece.type}`);
      return [];
  }
};

/**
 * Exports all move-related functions
 */
export * from './pawn';
export * from './rook';
export * from './knight';
export * from './bishop';
export * from './queen';
export * from './king';
