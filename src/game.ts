import {
  type Board,
  type GameState,
  type Move,
  type Position,
  type Piece,
  Color,
  PieceType,
  type SpecialMove,
} from './types';
import { clearPosition, cloneBoard, getPieceAt, isValidPosition, placePiece, initBoard } from './board';
import { getLegalMoves } from './moves';
import { arePositionsEqual } from './helper';

/**
 * Moves a piece on the chess board following chess rules.
 *
 * @param from - Starting position of the piece
 * @param to - Target position for the piece
 * @param gameState - Current game state
 * @param promotionType - Optional piece type to promote a pawn to (defaults to Queen)
 * @returns A new game state with the updated board or null if the move is invalid
 */
export const movePiece = (
  from: Position,
  to: Position,
  gameState: GameState,
  promotionType: PieceType = PieceType.QUEEN
): GameState | null => {
  // Check if positions are valid
  if (!isValidPosition(from) || !isValidPosition(to)) {
    return null;
  }

  // Get the piece at the starting position
  const piece = getPieceAt(from, gameState.board);
  if (!piece) {
    return null;
  }
  // Cannot move if it's not your turn
  if (piece.color !== gameState.currentTurn) {
    return null;
  }

  // Get all legal moves for the piece
  const legalMoves = getLegalMoves(from, gameState);

  // Find if the requested move is in the list of legal moves
  const validMove = legalMoves.find((move) => arePositionsEqual(move.to, to));

  // If the move is not legal, return null
  if (!validMove) {
    return null;
  }

  // Create a new board state (clone to avoid modifying the original)
  const newBoard = cloneBoard(gameState.board);

  // Calculate captured piece (includes en-passant)
  let capturedPiece: Piece | null = null;
  if (validMove.special === 'en-passant' && validMove.capturedPiecePosition) {
    capturedPiece = getPieceAt(validMove.capturedPiecePosition, newBoard);
    // Clear the en-passant captured pawn
    clearPosition(newBoard, validMove.capturedPiecePosition);
  } else {
    capturedPiece = getPieceAt(to, newBoard);
  }

  // Move the piece
  newBoard[from.row][from.col] = null;

  // Create a copy of the piece with hasMoved set to true
  let movedPiece: Piece = {
    ...piece,
    hasMoved: true,
  };

  // Handle special case: Promotion
  if (validMove.special === 'promotion') {
    // Replace the pawn with the desired promotion piece (default is Queen)
    movedPiece = {
      color: piece.color,
      type: promotionType,
      hasMoved: true,
    };
  }

  // Place the moved piece at the destination
  placePiece(newBoard, to, movedPiece);

  // Handle special case: Castling
  if (validMove.special === 'castling') {
    // Determine if it's kingside or queenside castling based on column difference
    const isKingside = to.col > from.col;

    if (isKingside) {
      // Move the kingside rook
      const rookFrom = { col: 7, row: from.row };
      const rookTo = { col: 5, row: from.row };

      // Get the rook
      const rook = getPieceAt(rookFrom, newBoard);
      if (rook) {
        // Move the rook
        clearPosition(newBoard, rookFrom);
        placePiece(newBoard, rookTo, { ...rook, hasMoved: true });
      }
    } else {
      // Move the queenside rook
      const rookFrom = { col: 0, row: from.row };
      const rookTo = { col: 3, row: from.row };

      // Get the rook
      const rook = getPieceAt(rookFrom, newBoard);
      if (rook) {
        // Move the rook
        clearPosition(newBoard, rookFrom);
        placePiece(newBoard, rookTo, { ...rook, hasMoved: true });
      }
    }
  }

  // Create a new move history entry
  const moveHistoryEntry = {
    from,
    to,
    piece: { ...piece },
    special: validMove.special,
    captured: capturedPiece || undefined,
    promotedTo: validMove.special === 'promotion' ? promotionType : undefined,
  };

  // Create a new game state with the updated board
  const newGameState: GameState = {
    ...gameState,
    board: newBoard,
    currentTurn: gameState.currentTurn === Color.WHITE ? Color.BLACK : Color.WHITE,
    moveHistory: [...gameState.moveHistory, moveHistoryEntry],
    // Reset these flags - they should be recalculated after the move
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
  };

  // Return the new game state
  return newGameState;
};

/**
 * Checks if a move is valid according to chess rules
 *
 * @param from - Starting position
 * @param to - Target position
 * @param gameState - Current game state
 * @returns True if the move is valid, false otherwise
 */
export const isValidMove = (from: Position, to: Position, gameState: GameState): boolean => {
  // Get all legal moves for the piece
  const legalMoves = getLegalMoves(from, gameState);

  // Check if the requested move is in the list of legal moves
  return legalMoves.some((move) => arePositionsEqual(move.to, to));
};

/**
 * Initialize a new game state with the standard chess setup
 * @returns Initial game state with pieces in starting positions
 */
export const initGameState = (): GameState => {
  return {
    board: initBoard(),
    currentTurn: Color.WHITE, // White always moves first in standard chess
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
  };
};

/**
 * Change the current turn from one player to another
 * @param gameState - Current game state
 * @returns New game state with updated current player
 */
export const switchTurn = (gameState: GameState): GameState => {
  return {
    ...gameState,
    currentTurn: gameState.currentTurn === Color.WHITE ? Color.BLACK : Color.WHITE,
  };
};

/**
 * Add a move to the game history
 * @param gameState - Current game state
 * @param from - Starting position of the move
 * @param to - Ending position of the move
 * @param piece - The piece that was moved
 * @param captured - Optional captured piece
 * @param special - Optional special move type
 * @returns New game state with updated move history
 */
export const addMoveToHistory = (
  gameState: GameState,
  from: Position,
  to: Position,
  piece: Piece,
  captured?: Piece,
  special?: SpecialMove
): GameState => {
  const moveHistoryEntry = {
    from,
    to,
    piece: { ...piece },
    captured,
    special,
  };

  return {
    ...gameState,
    moveHistory: [...gameState.moveHistory, moveHistoryEntry],
  };
};

/**
 * Get the current player's color
 * @param gameState - Current game state
 * @returns The color of the current player
 */
export const getCurrentPlayer = (gameState: GameState): Color => {
  return gameState.currentTurn;
};

/**
 * Get the move history
 * @param gameState - Current game state
 * @returns Array of move history entries
 */
export const getMoveHistory = (
  gameState: GameState
): Array<{
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  special?: SpecialMove;
}> => {
  return [...gameState.moveHistory];
};

/**
 * Check if a specific player is in check
 * @param gameState - Current game state
 * @param color - Color of the player to check
 * @returns True if the player is in check, false otherwise
 */
export const isPlayerInCheck = (gameState: GameState, color: Color): boolean => {
  // Find the king's position for the specified color
  const kingPosition = findKingPosition(gameState, color);
  if (!kingPosition) return false; // If no king found (shouldn't happen in normal chess)

  // Check if any opponent piece can attack the king's position
  const opponentColor = color === Color.WHITE ? Color.BLACK : Color.WHITE;
  return canColorAttackPosition(gameState, opponentColor, kingPosition);
};

/**
 * Find the position of a king of specified color
 * @param gameState - Current game state
 * @param color - Color of the king to find
 * @returns Position of the king or null if not found
 */
const findKingPosition = (gameState: GameState, color: Color): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.type === PieceType.KING && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null; // King not found (shouldn't happen in a valid chess game)
};

/**
 * Check if any piece of specified color can attack a position
 * @param gameState - Current game state
 * @param color - Color of the attacking pieces
 * @param position - Position to check if it can be attacked
 * @returns True if the position can be attacked, false otherwise
 */
const canColorAttackPosition = (gameState: GameState, color: Color, position: Position): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === color) {
        // Check if this piece can move to the king's position
        if (isValidMove({ row, col }, position, gameState)) {
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * Check if a player is in checkmate
 * @param gameState - Current game state
 * @param color - Color of the player to check
 * @returns True if the player is in checkmate, false otherwise
 */
export const isCheckmate = (gameState: GameState, color: Color): boolean => {
  // First, check if the player is in check
  if (!isPlayerInCheck(gameState, color)) {
    return false; // Not in check, so not in checkmate
  }

  // Check if the player can make any move to get out of check
  const activePieces = getActivePieces(gameState, color);

  for (const piecePosition of activePieces) {
    // Find all legal moves for this piece
    const legalMoves = getLegalMoves(piecePosition, gameState);

    // Try each legal move to see if it gets the player out of check
    for (const move of legalMoves) {
      // Use the existing movePiece function to properly handle all special moves
      const tempGameState = movePiece(piecePosition, move.to, gameState);
      if (!tempGameState) continue; // Skip if the move is invalid for some reason

      if (!isPlayerInCheck(tempGameState, color)) {
        return false; // Found a move that gets out of check, not checkmate
      }
    }
  }

  // No move can get the player out of check, so it's checkmate
  return true;
};

/**
 * Update the game state to reflect check and checkmate status for the opponent
 * @param gameState - Current game state
 * @returns Updated game state with isCheck and isCheckmate flags set for the opponent's status
 */
export const updateCheckStatus = (gameState: GameState): GameState => {
  const currentPlayer = gameState.currentTurn;
  const opponentColor = currentPlayer === Color.WHITE ? Color.BLACK : Color.WHITE;

  // Check if the opponent is in check
  const isOpponentInCheck = isPlayerInCheck(gameState, opponentColor);

  // Check if the opponent is in checkmate
  const isOpponentInCheckmate = isCheckmate(gameState, opponentColor);

  return {
    ...gameState,
    isCheck: isOpponentInCheck,
    isCheckmate: isOpponentInCheckmate,
  };
};

/**
 * Returns positions of all active pieces for a given color
 */
function getActivePieces(gameState: GameState, color: Color): Position[] {
  const pieces: Position[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === color) {
        pieces.push({ row, col });
      }
    }
  }

  return pieces;
}
