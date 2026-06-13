export type PieceColor = "w" | "b";
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

export interface ChessPiece {
    color: PieceColor;
    type: PieceType;
}

export class ChessBoard {
    board: (ChessPiece | null)[][];
    turn: PieceColor = "w";

    constructor() {
        this.board = this.createInitialBoard();
    }

    createInitialBoard(): (ChessPiece | null)[][] {
        const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Configurar piezas negras (Fila 0)
        const order: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
        for(let i=0; i<8; i++) {
            board[0][i] = { color: "b", type: order[i] };
            board[1][i] = { color: "b", type: "p" };
        }

        // Configurar piezas blancas (Fila 7)
        for(let i=0; i<8; i++) {
            board[7][i] = { color: "w", type: order[i] };
            board[6][i] = { color: "w", type: "p" };
        }

        return board;
    }

    movePiece(fromX: number, fromY: number, toX: number, toY: number, playerColor: PieceColor): boolean {
        // Validación MUY básica (MVP). En un entorno real se usaría una librería como chess.js para validar en backend
        const piece = this.board[fromY][fromX];
        
        if (!piece || piece.color !== playerColor || this.turn !== playerColor) {
            return false;
        }

        // Mover pieza
        this.board[toY][toX] = piece;
        this.board[fromY][fromX] = null;

        // Cambiar turno
        this.turn = this.turn === "w" ? "b" : "w";
        return true;
    }
}
