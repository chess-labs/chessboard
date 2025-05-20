import { type Board, type GameState, type Move, type Position, type Piece, Color, type SpecialMove } from './types';
import { clearPosition, cloneBoard, getPieceAt, isValidPosition, placePiece } from './board';
import { getLegalMoves } from './moves';

/**
 * Moves a piece on the chess board following chess rules.
 *
 * @param from - Starting position of the piece
 * @param to - Target position for the piece
 * @param gameState - Current game state
 * @returns A new game state with the updated board or null if the move is invalid
 */
export const movePiece = (from: Position, to: Position, gameState: GameState): GameState | null => {
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
  const validMove = legalMoves.find((move) => move.to.col === to.col && move.to.row === to.row);

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
  const movedPiece: Piece = {
    ...piece,
    hasMoved: true,
  };

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
  return legalMoves.some((move) => move.to.col === to.col && move.to.row === to.row);
};
