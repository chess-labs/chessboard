import type { GameState, Move, Position } from '../types';
import { PieceType } from '../types';
import { getPieceAt, isValidPosition, cloneBoard, clearPosition, placePiece } from '../board';
import { getPawnMoves } from './pawn';
import { getRookMoves } from './rook';
import { getKnightMoves } from './knight';
import { getBishopMoves } from './bishop';
import { getQueenMoves } from './queen';
import { getKingMoves } from './king';
import { isPlayerInCheck } from '../game';

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

  // Get potential moves based on piece type
  let potentialMoves: Move[] = [];

  // Dispatch to the appropriate piece-specific function based on the piece type
  switch (piece.type) {
    case PieceType.PAWN:
      potentialMoves = getPawnMoves(position, gameState);
      break;

    case PieceType.ROOK:
      potentialMoves = getRookMoves(position, gameState);
      break;

    case PieceType.KNIGHT: {
      // Knight has a different function signature, so we need to adapt it
      const knightPositions = getKnightMoves(position);

      // Convert positions to moves and filter friendly fire
      potentialMoves = knightPositions.flatMap((to) => {
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
      break;
    }

    case PieceType.BISHOP:
      potentialMoves = getBishopMoves(position, gameState);
      break;

    case PieceType.QUEEN:
      potentialMoves = getQueenMoves(position, gameState);
      break;

    case PieceType.KING:
      potentialMoves = getKingMoves(position, gameState);
      break;

    default:
      // Unknown piece type - return empty array
      return [];
  }

  // Filter out moves that would put/leave the player's king in check
  return potentialMoves.filter((move) => {
    // Create a cloned board to simulate the move
    const clonedBoard = cloneBoard(gameState.board);

    // Get the piece at the source position
    const movingPiece = getPieceAt(position, clonedBoard);
    if (!movingPiece) return false;

    // Remove the piece from the source position
    clearPosition(clonedBoard, position);

    // If there's a capture, remove the captured piece
    const targetPiece = getPieceAt(move.to, clonedBoard);
    if (targetPiece) {
      clearPosition(clonedBoard, move.to);
    }

    // Handle en passant capture specifically
    if (move.special === 'en-passant' && move.capturedPiecePosition) {
      clearPosition(clonedBoard, move.capturedPiecePosition);
    }

    // Place the piece at the destination
    placePiece(clonedBoard, move.to, { ...movingPiece, hasMoved: true });

    // Create a temporary game state with the move applied
    const tempGameState = {
      ...gameState,
      board: clonedBoard,
    };

    // Check if the player's king is in check after this move
    return !isPlayerInCheck(tempGameState, piece.color);
  });
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
