// @ts-nocheck
import { Room, Client } from "@colyseus/core";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { ChessBoard } from "../game/ChessRules";

export class ChessPieceSchema extends Schema {
    @type("string") color: string;
    @type("string") type: string;
}

export class ChessPlayerSchema extends Schema {
    @type("string") name: string;
    @type("string") color: string; // "w" o "b"
}

export class ChessState extends Schema {
    @type({ map: ChessPlayerSchema }) players = new MapSchema<ChessPlayerSchema>();
    @type("string") currentTurn: string = "w";
    
    // Matriz de 8x8 linealizada o enviada como strings para facilitar la sincronización (MVP)
    @type([ "string" ]) board = new ArraySchema<string>();
}

export class ChessRoom extends Room<any, any> {
    maxClients = 2;
    private gameLogic: ChessBoard;

    onCreate(options: any) {
        this.setState(new ChessState());
        this.gameLogic = new ChessBoard();
        this.syncBoard();

        this.onMessage("move", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                const { fromX, fromY, toX, toY } = data;
                const success = this.gameLogic.movePiece(fromX, fromY, toX, toY, player.color as "w" | "b");
                
                if (success) {
                    this.state.currentTurn = this.gameLogic.turn;
                    this.syncBoard();
                }
            }
        });
    }

    onJoin(client: Client, options: any) {
        const player = new ChessPlayerSchema();
        player.name = options.name || `Player_${client.sessionId}`;
        
        // El primer jugador es blanco, el segundo es negro
        player.color = this.clients.length === 1 ? "w" : "b";
        
        this.state.players.set(client.sessionId, player);
    }

    syncBoard() {
        this.state.board.clear();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.gameLogic.board[y][x];
                if (piece) {
                    this.state.board.push(`${piece.color}${piece.type}`);
                } else {
                    this.state.board.push("");
                }
            }
        }
    }

    onLeave(client: Client, code?: number) {
        this.state.players.delete(client.sessionId);
    }
}
