import type { Board, GameState, Piece, Position } from './types';
import { Color, PieceType } from './types';
import { initBoard, placePiece } from './board';

// Module-level mapping objects to avoid repeated allocations
const PIECE_TO_CHAR_MAP: Record<PieceType, string> = {
  [PieceType.PAWN]: 'p',
  [PieceType.ROOK]: 'r',
  [PieceType.KNIGHT]: 'n',
  [PieceType.BISHOP]: 'b',
  [PieceType.QUEEN]: 'q',
  [PieceType.KING]: 'k',
};

const CHAR_TO_PIECE_TYPE_MAP: Record<string, PieceType> = {
  p: PieceType.PAWN,
  r: PieceType.ROOK,
  n: PieceType.KNIGHT,
  b: PieceType.BISHOP,
  q: PieceType.QUEEN,
  k: PieceType.KING,
};

/**
 * Converts a chess piece to its FEN character representation
 * @param piece - The chess piece to convert
 * @returns Single character representing the piece in FEN notation
 */
export const pieceToFenChar = (piece: Piece): string => {
  const char = PIECE_TO_CHAR_MAP[piece.type];
  return piece.color === Color.WHITE ? char.toUpperCase() : char;
};

/**
 * Converts a FEN character to a chess piece
 * @param fenChar - Single character from FEN notation
 * @returns Chess piece object or null if invalid
 */
export const fenCharToPiece = (fenChar: string): Piece | null => {
  if (fenChar === ' ' || fenChar === '/') return null;

  const color = fenChar === fenChar.toUpperCase() ? Color.WHITE : Color.BLACK;
  const lowerChar = fenChar.toLowerCase();

  const type = CHAR_TO_PIECE_TYPE_MAP[lowerChar];
  if (!type) return null;

  return { type, color };
};

/**
 * Converts a chess board to FEN board representation (piece placement only)
 * @param board - 8x8 chess board
 * @returns FEN string representing piece positions
 */
export const boardToFenPieces = (board: Board): string => {
  let fen = '';

  for (let row = 0; row < 8; row++) {
    let emptyCount = 0;

    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];

      if (piece) {
        // If we had empty squares, add the count first
        if (emptyCount > 0) {
          fen += emptyCount.toString();
          emptyCount = 0;
        }
        // Add the piece character
        fen += pieceToFenChar(piece);
      } else {
        emptyCount++;
      }
    }

    // Add remaining empty squares for this row
    if (emptyCount > 0) {
      fen += emptyCount.toString();
    }

    // Add row separator (except for last row)
    if (row < 7) {
      fen += '/';
    }
  }

  return fen;
};

/**
 * Converts FEN piece placement to a chess board
 * @param fenPieces - FEN string representing piece positions
 * @returns 8x8 chess board
 */
export const fenPiecesToBoard = (fenPieces: string): Board => {
  const board = initBoard();

  // Clear the board first
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      board[row][col] = null;
    }
  }

  const rows = fenPieces.split('/');
  if (rows.length !== 8) {
    throw new Error('Invalid FEN: must have 8 rows');
  }

  for (let row = 0; row < 8; row++) {
    const rowStr = rows[row];
    let col = 0;

    for (const char of rowStr) {
      if (char >= '1' && char <= '8') {
        // Empty squares
        const emptyCount = Number.parseInt(char);
        col += emptyCount;
      } else {
        // Piece
        const piece = fenCharToPiece(char);
        if (!piece) {
          throw new Error(`Invalid FEN: unrecognized character '${char}' in row ${row + 1}`);
        }
        if (col < 8) {
          board[row][col] = piece;
        }
        col++;
      }
    }
  }

  return board;
};

/**
 * Determines castling rights from current game state
 * @param gameState - Current game state
 * @returns Castling rights string for FEN
 */
export const getCastlingRights = (gameState: GameState): string => {
  let rights = '';

  // Use explicit castling rights if available
  if (gameState.castlingRights) {
    if (gameState.castlingRights.whiteKingside) rights += 'K';
    if (gameState.castlingRights.whiteQueenside) rights += 'Q';
    if (gameState.castlingRights.blackKingside) rights += 'k';
    if (gameState.castlingRights.blackQueenside) rights += 'q';
    return rights || '-';
  }

  // Fallback: check if kings and rooks have moved (legacy behavior)
  const whiteKing = gameState.board[7][4];
  const blackKing = gameState.board[0][4];
  const whiteKingsideRook = gameState.board[7][7];
  const whiteQueensideRook = gameState.board[7][0];
  const blackKingsideRook = gameState.board[0][7];
  const blackQueensideRook = gameState.board[0][0];

  // White kingside castling
  if (whiteKing && !whiteKing.hasMoved && whiteKingsideRook && !whiteKingsideRook.hasMoved) {
    rights += 'K';
  }

  // White queenside castling
  if (whiteKing && !whiteKing.hasMoved && whiteQueensideRook && !whiteQueensideRook.hasMoved) {
    rights += 'Q';
  }

  // Black kingside castling
  if (blackKing && !blackKing.hasMoved && blackKingsideRook && !blackKingsideRook.hasMoved) {
    rights += 'k';
  }

  // Black queenside castling
  if (blackKing && !blackKing.hasMoved && blackQueensideRook && !blackQueensideRook.hasMoved) {
    rights += 'q';
  }

  return rights || '-';
};

/**
 * Gets en passant target square from game state
 * @param gameState - Current game state
 * @returns En passant target square or '-' if none
 */
export const getEnPassantTarget = (gameState: GameState): string => {
  // Use explicit en passant target if available
  if (gameState.enPassantTarget !== undefined) {
    return gameState.enPassantTarget || '-';
  }

  // Fallback: calculate from move history (legacy behavior)
  if (gameState.moveHistory.length === 0) return '-';

  const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];

  // Check if last move was a two-square pawn advance
  if (lastMove.piece.type === PieceType.PAWN && lastMove.special === 'two-square-advance') {
    // Calculate en passant target square (square behind the pawn)
    const targetRow = lastMove.piece.color === Color.WHITE ? lastMove.to.row + 1 : lastMove.to.row - 1;
    const targetCol = lastMove.to.col;

    // Convert to algebraic notation
    const file = String.fromCharCode(97 + targetCol); // a-h
    const rank = (8 - targetRow).toString(); // 1-8

    return file + rank;
  }

  return '-';
};

/**
 * Calculates halfmove clock from move history
 * @param moveHistory - Array of moves
 * @returns Number of halfmoves since last capture or pawn move
 */
export const calculateHalfmoveClock = (moveHistory: GameState['moveHistory']): number => {
  let halfmoves = 0;

  // Count backwards from the last move until we find a capture or pawn move
  for (let i = moveHistory.length - 1; i >= 0; i--) {
    const move = moveHistory[i];

    // Reset counter if it's a pawn move or capture
    if (move.piece.type === PieceType.PAWN || move.captured) {
      break;
    }

    halfmoves++;
  }

  return halfmoves;
};

/**
 * Parses castling rights from FEN string
 * @param castlingStr - Castling rights string from FEN
 * @returns Castling rights object
 */
export const parseCastlingRights = (castlingStr: string) => {
  return {
    whiteKingside: castlingStr.includes('K'),
    whiteQueenside: castlingStr.includes('Q'),
    blackKingside: castlingStr.includes('k'),
    blackQueenside: castlingStr.includes('q'),
  };
};

/**
 * Converts a complete game state to FEN notation
 * @param gameState - Current game state
 * @returns Complete FEN string
 */
export const gameStateToFen = (gameState: GameState): string => {
  const pieces = boardToFenPieces(gameState.board);
  const activeColor = gameState.currentTurn === Color.WHITE ? 'w' : 'b';
  const castlingRights = getCastlingRights(gameState);
  const enPassantTarget = getEnPassantTarget(gameState);

  // Use explicit halfmove clock if available, otherwise calculate from move history
  const halfmoveClock =
    gameState.halfmoveClock !== undefined
      ? gameState.halfmoveClock.toString()
      : calculateHalfmoveClock(gameState.moveHistory).toString();

  // Use explicit fullmove number if available, otherwise calculate from move history
  const fullmoveNumber =
    gameState.fullmoveNumber !== undefined
      ? gameState.fullmoveNumber.toString()
      : (Math.floor(gameState.moveHistory.length / 2) + 1).toString();

  return `${pieces} ${activeColor} ${castlingRights} ${enPassantTarget} ${halfmoveClock} ${fullmoveNumber}`;
};

/**
 * Converts a FEN string to a game state
 * @param fen - FEN notation string
 * @returns Game state object
 */
export const fenToGameState = (fen: string): GameState => {
  const parts = fen.trim().split(/\s+/);

  if (parts.length !== 6) {
    throw new Error('Invalid FEN: must have 6 space-separated parts');
  }

  const [pieces, activeColor, castlingRights, enPassantTarget, halfmoveClock, fullmoveNumber] = parts;

  // Convert pieces to board
  const board = fenPiecesToBoard(pieces);

  // Determine current turn
  const currentTurn = activeColor === 'w' ? Color.WHITE : Color.BLACK;

  // Parse castling rights
  const castling = parseCastlingRights(castlingRights);

  // Parse en passant target (null if '-')
  const enPassant = enPassantTarget === '-' ? undefined : enPassantTarget;

  // Parse halfmove clock and fullmove number
  const halfmove = Number.parseInt(halfmoveClock) || 0;
  const fullmove = Number.parseInt(fullmoveNumber) || 1;

  // Create game state with parsed FEN information
  const gameState: GameState = {
    board,
    currentTurn,
    moveHistory: [], // Cannot reconstruct move history from FEN alone
    isCheck: false, // Would need to calculate based on board position
    isCheckmate: false, // Would need to calculate based on available moves
    isStalemate: false, // Would need to calculate based on available moves
    castlingRights: castling,
    enPassantTarget: enPassant,
    halfmoveClock: halfmove,
    fullmoveNumber: fullmove,
  };

  return gameState;
};

/**
 * Standard starting position FEN
 */
export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
