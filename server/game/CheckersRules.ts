export type CheckerColor = "w" | "b";
export type CheckerType = "man" | "king";

export interface CheckerPiece {
    color: CheckerColor;
    type: CheckerType;
}

export class CheckersBoard {
    board: (CheckerPiece | null)[][];
    turn: CheckerColor = "w";

    constructor() {
        this.board = this.createInitialBoard();
    }

    createInitialBoard(): (CheckerPiece | null)[][] {
        const board: (CheckerPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Fichas negras (arriba)
        for(let row=0; row<3; row++) {
            for(let col=0; col<8; col++) {
                if((row + col) % 2 !== 0) {
                    board[row][col] = { color: "b", type: "man" };
                }
            }
        }

        // Fichas blancas (abajo)
        for(let row=5; row<8; row++) {
            for(let col=0; col<8; col++) {
                if((row + col) % 2 !== 0) {
                    board[row][col] = { color: "w", type: "man" };
                }
            }
        }

        return board;
    }

    movePiece(fromX: number, fromY: number, toX: number, toY: number, playerColor: CheckerColor): boolean {
        // Validación básica MVP para Damas
        const piece = this.board[fromY][fromX];
        
        if (!piece || piece.color !== playerColor || this.turn !== playerColor) {
            return false;
        }

        // Mover pieza
        this.board[toY][toX] = piece;
        this.board[fromY][fromX] = null;

        // Coronar reina (King) si llega al final
        if (piece.color === "w" && toY === 0) piece.type = "king";
        if (piece.color === "b" && toY === 7) piece.type = "king";

        // Cambiar turno
        this.turn = this.turn === "w" ? "b" : "w";
        return true;
    }
}
