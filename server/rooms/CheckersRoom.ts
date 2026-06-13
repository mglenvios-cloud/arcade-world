// @ts-nocheck
import { Room, Client } from "@colyseus/core";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { CheckersBoard } from "../game/CheckersRules";

export class CheckersPlayerSchema extends Schema {
    @type("string") name: string;
    @type("string") color: string; // "w" o "b"
}

export class CheckersState extends Schema {
    @type({ map: CheckersPlayerSchema }) players = new MapSchema<CheckersPlayerSchema>();
    @type("string") currentTurn: string = "w";
    
    @type([ "string" ]) board = new ArraySchema<string>();
}

export class CheckersRoom extends Room<any, any> {
    maxClients = 2;
    private gameLogic: CheckersBoard;

    onCreate(options: any) {
        this.setState(new CheckersState());
        this.gameLogic = new CheckersBoard();
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
        const player = new CheckersPlayerSchema();
        player.name = options.name || `Player_${client.sessionId}`;
        
        // Blancas inician siempre en Damas tradicionales también
        player.color = this.clients.length === 1 ? "w" : "b";
        
        this.state.players.set(client.sessionId, player);
    }

    syncBoard() {
        this.state.board.clear();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.gameLogic.board[y][x];
                if (piece) {
                    // formamos string: ej "w_man" o "b_king"
                    this.state.board.push(`${piece.color}_${piece.type}`);
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
