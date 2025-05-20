import type { Board, GameState, Move, Piece, Position, SpecialMove } from './types';
import { Color, PieceType } from './types';
import {
  clearBoard,
  clearPosition,
  cloneBoard,
  getPieceAt,
  initBoard,
  isPathClear,
  isValidPosition,
  placePiece,
} from './board';
import { arePositionsEqual } from './helper';
import { getLegalMoves } from './moves';

/**
 * Moves a piece on the chess board following chess rules.
 *
 * @param from - Starting position of the piece
 * @param to - Target position for the piece
 * @param gameState - Current game state
 * @param promotionType - Optional piece type to promote a pawn to (defaults to Queen)
 * @param skipStatusUpdate - Internal flag to prevent recursion in validation checks
 * @returns A new game state with the updated board or null if the move is invalid
 */
export const movePiece = (
  from: Position,
  to: Position,
  gameState: GameState,
  promotionType = PieceType.QUEEN,
  skipStatusUpdate = false
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
    // Validate promotion type (must be ROOK, KNIGHT, BISHOP, or QUEEN)
    const validPromotionTypes = [PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN];
    const finalPromotionType = validPromotionTypes.includes(promotionType) ? promotionType : PieceType.QUEEN;

    // Replace the pawn with the desired promotion piece (default is Queen)
    movedPiece = {
      color: piece.color,
      type: finalPromotionType,
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
  let newGameState: GameState = {
    ...gameState,
    board: newBoard,
    currentTurn: gameState.currentTurn === Color.WHITE ? Color.BLACK : Color.WHITE,
    moveHistory: [...gameState.moveHistory, moveHistoryEntry],
    // Reset these flags - they will be recalculated
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
  };

  // Check if this move would put the player's own king in check
  const playerColor = gameState.currentTurn;

  // Create a temporary state with original player's turn to check if their king is in check
  const tempStateForCheck = {
    ...newGameState,
    currentTurn: playerColor,
  };

  if (isPlayerInCheck(tempStateForCheck, playerColor)) {
    return null; // Move is illegal because it puts/leaves own king in check
  }

  // Update check, checkmate and stalemate status for the opponent (unless skipped)
  if (!skipStatusUpdate) {
    newGameState = updateGameStatus(newGameState);
  }

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

  // Look through all squares to find opponent pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === opponentColor) {
        const piecePosition = { row, col };

        // 간소화된 방식으로 공격 가능 여부 확인 (재귀 방지)
        if (canPieceAttackPosition(piece, piecePosition, kingPosition, gameState.board)) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * 기물이 주어진 위치를 공격할 수 있는지 확인하는 간소화된 함수
 * getLegalMoves를 호출하지 않고 직접 이동 규칙 확인
 */
const canPieceAttackPosition = (
  piece: Piece,
  piecePosition: Position,
  targetPosition: Position,
  board: Board
): boolean => {
  // 두 위치 간의 차이 계산
  const deltaRow = targetPosition.row - piecePosition.row;
  const deltaCol = targetPosition.col - piecePosition.col;
  const absDeltaRow = Math.abs(deltaRow);
  const absDeltaCol = Math.abs(deltaCol);

  switch (piece.type) {
    case PieceType.PAWN: {
      // 폰은 대각선으로만 공격 가능
      const direction = piece.color === Color.WHITE ? -1 : 1;
      return absDeltaCol === 1 && deltaRow === direction;
    }

    case PieceType.ROOK:
      // 룩은 수직이나 수평으로만 이동
      if ((deltaRow === 0 || deltaCol === 0) && isPathClear(piecePosition, targetPosition, board)) {
        return true;
      }
      return false;

    case PieceType.KNIGHT:
      // 나이트는 L자 이동
      return (absDeltaRow === 2 && absDeltaCol === 1) || (absDeltaRow === 1 && absDeltaCol === 2);

    case PieceType.BISHOP:
      // 비숍은 대각선으로만 이동
      if (absDeltaRow === absDeltaCol && isPathClear(piecePosition, targetPosition, board)) {
        return true;
      }
      return false;

    case PieceType.QUEEN:
      // 퀸은 수직, 수평 또는 대각선으로 이동
      if (
        (deltaRow === 0 || deltaCol === 0 || absDeltaRow === absDeltaCol) &&
        isPathClear(piecePosition, targetPosition, board)
      ) {
        return true;
      }
      return false;

    case PieceType.KING:
      // 킹은 모든 방향으로 한 칸만 이동
      return absDeltaRow <= 1 && absDeltaCol <= 1;

    default:
      return false;
  }
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

  // Find the king position
  const kingPosition = findKingPosition(gameState, color);
  if (!kingPosition) return false; // If no king found (shouldn't happen)

  // 1. 왕이 움직여서 체크를 피할 수 있는지 검사
  const kingPiece = getPieceAt(kingPosition, gameState.board);
  if (!kingPiece) return false;

  // 왕의 모든 가능한 이동 위치 확인
  const kingMoves = getLegalMoves(kingPosition, gameState);
  for (const move of kingMoves) {
    // 임시 게임 상태에서 왕 이동
    const newGameState = movePiece(kingPosition, move.to, gameState, undefined, true);
    if (newGameState && !isPlayerInCheck(newGameState, color)) {
      return false; // 왕이 움직여서 체크를 피할 수 있음
    }
  }

  // 2. 다른 기물이 공격자를 막거나 잡을 수 있는지 검사
  const attackingPieces = findAttackingPieces(gameState, color);

  // 공격자가 여러 개이면 왕이 직접 피하는 것만 가능
  if (attackingPieces.length > 1) {
    // 이미 왕의 이동으로 체크를 피할 수 없다고 확인했으므로 체크메이트
    return true;
  }

  // 공격자가 하나일 경우, 다른 기물이 이를 막거나 잡을 수 있는지 확인
  if (attackingPieces.length === 1) {
    const attacker = attackingPieces[0];
    const attackerPosition = { row: attacker.row, col: attacker.col };

    // 3-1. 다른 기물이 공격자를 잡을 수 있는지 확인
    const defenders = getActivePieces(gameState, color);
    for (const defenderPos of defenders) {
      // 왕은 이미 확인했으므로 스킵
      if (defenderPos.row === kingPosition.row && defenderPos.col === kingPosition.col) {
        continue;
      }

      if (isValidMove(defenderPos, attackerPosition, gameState)) {
        const newGameState = movePiece(defenderPos, attackerPosition, gameState, undefined, true);
        if (newGameState && !isPlayerInCheck(newGameState, color)) {
          return false; // 다른 기물이 공격자를 잡을 수 있음
        }
      }
    }

    // 3-2. 공격 경로를 다른 기물이 막을 수 있는지 확인
    // 이는 비숍, 룩, 퀸의 경우에만 가능
    if (
      attacker.piece.type === PieceType.BISHOP ||
      attacker.piece.type === PieceType.ROOK ||
      attacker.piece.type === PieceType.QUEEN
    ) {
      const blockingSquares = getPathBetween(attackerPosition, kingPosition);

      for (const defenderPos of defenders) {
        // 왕은 이미 확인했으므로 스킵
        if (defenderPos.row === kingPosition.row && defenderPos.col === kingPosition.col) {
          continue;
        }

        for (const blockPos of blockingSquares) {
          if (isValidMove(defenderPos, blockPos, gameState)) {
            const newGameState = movePiece(defenderPos, blockPos, gameState, undefined, true);
            if (newGameState && !isPlayerInCheck(newGameState, color)) {
              return false; // 다른 기물이 공격 경로를 막을 수 있음
            }
          }
        }
      }
    }
  }

  // 모든 체크를 피할 방법이 없으면 체크메이트
  return true;
};

/**
 * 킹을 공격하는 모든 적 기물의 위치 찾기
 */
function findAttackingPieces(
  gameState: GameState,
  defendingColor: Color
): Array<{ row: number; col: number; piece: Piece }> {
  const kingPosition = findKingPosition(gameState, defendingColor);
  if (!kingPosition) return [];

  const attackingColor = defendingColor === Color.WHITE ? Color.BLACK : Color.WHITE;
  const attackers = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === attackingColor) {
        const piecePosition = { row, col };
        if (canPieceAttackPosition(piece, piecePosition, kingPosition, gameState.board)) {
          attackers.push({ row, col, piece });
        }
      }
    }
  }

  return attackers;
}

/**
 * 두 위치 사이의 경로에 있는 모든 칸 반환 (공격자와 킹 위치 제외)
 */
function getPathBetween(from: Position, to: Position): Position[] {
  const path: Position[] = [];

  const deltaRow = to.row - from.row;
  const deltaCol = to.col - from.col;

  // 직선 또는 대각선 경로인지 확인
  const isLinear = deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol);

  if (!isLinear) return path; // 경로가 직선 또는 대각선이 아니면 빈 배열 반환

  const rowStep = deltaRow === 0 ? 0 : deltaRow > 0 ? 1 : -1;
  const colStep = deltaCol === 0 ? 0 : deltaCol > 0 ? 1 : -1;

  let row = from.row + rowStep;
  let col = from.col + colStep;

  // 목적지 직전까지 모든 칸 추가
  while (row !== to.row || col !== to.col) {
    path.push({ row, col });
    row += rowStep;
    col += colStep;
  }

  return path;
}

/**
 * Check if a player is in stalemate
 * @param gameState - Current game state
 * @param color - Color of the player to check
 * @returns True if the player is in stalemate, false otherwise
 */
export const isStalemate = (gameState: GameState, color: Color): boolean => {
  // First, check if the player is in check
  if (isPlayerInCheck(gameState, color)) {
    return false; // If in check, it's not stalemate
  }

  // Check if the player can make any legal move
  const activePieces = getActivePieces(gameState, color);

  for (const piecePosition of activePieces) {
    // Find all legal moves for this piece
    const legalMoves = getLegalMoves(piecePosition, gameState);

    // 디버깅용 로그 추가
    console.log(`Found ${legalMoves.length} moves for piece at ${piecePosition.col},${piecePosition.row}`);

    // Try each legal move to see if it's valid (doesn't put king in check)
    for (const move of legalMoves) {
      // Create a clone of the board to test the move
      const tempBoard = cloneBoard(gameState.board);

      // Get the piece
      const piece = getPieceAt(piecePosition, tempBoard);
      if (!piece) continue;

      // Move the piece on the cloned board
      clearPosition(tempBoard, piecePosition);
      placePiece(tempBoard, move.to, { ...piece, hasMoved: true });

      // Create a temporary game state with the move applied
      const tempGameState = {
        ...gameState,
        board: tempBoard,
        currentTurn: color,
      };

      // Check if the king is in check after this move
      if (!isPlayerInCheck(tempGameState, color)) {
        console.log(`Found valid move from ${piecePosition.col},${piecePosition.row} to ${move.to.col},${move.to.row}`);
        return false; // Found a legal move, not stalemate
      }
    }
  }

  // No legal moves available, it's stalemate
  console.log('No legal moves found, stalemate detected');
  return true;
};

/**
 * Update game state for check, checkmate and stalemate
 * @param gameState - Current game state
 * @returns Updated game state with check, checkmate and stalemate flags
 */
export const updateGameStatus = (gameState: GameState): GameState => {
  const currentPlayer = gameState.currentTurn;

  // Check if current player is in check
  const isInCheck = isPlayerInCheck(gameState, currentPlayer);

  // Check if current player is in checkmate
  const isInCheckmate = isInCheck && isCheckmate(gameState, currentPlayer);

  // Check if current player is in stalemate
  const isInStalemate = !isInCheck && isStalemate(gameState, currentPlayer);

  return {
    ...gameState,
    isCheck: isInCheck,
    isCheckmate: isInCheckmate,
    isStalemate: isInStalemate,
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
