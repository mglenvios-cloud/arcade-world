// @ts-nocheck
import { Room, Client } from "@colyseus/core";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { MemoryGame } from "../game/MemoryRules";

export class CardSchema extends Schema {
    @type("number") id: number;
    @type("string") value: string;
    @type("boolean") isFlipped: boolean;
    @type("boolean") isMatched: boolean;
}

export class MemoryPlayer extends Schema {
    @type("string") name: string;
    @type("number") score: number = 0;
}

export class MemoryState extends Schema {
    @type({ map: MemoryPlayer }) players = new MapSchema<MemoryPlayer>();
    @type([ CardSchema ]) cards = new ArraySchema<CardSchema>();
    @type("string") currentTurn: string = "";
    @type("string") status: string = "waiting";
}

export class MemoryRoom extends Room<any, any> {
    maxClients = 2;
    private gameLogic: MemoryGame;
    private checkTimeout: NodeJS.Timeout | null = null;

    onCreate(options: any) {
        this.setState(new MemoryState());

        this.onMessage("flip", (client, data) => {
            if (this.state.status !== "playing") return;
            if (client.sessionId !== this.state.currentTurn) return; // Sólo puede voltear el que tiene el turno
            if (this.checkTimeout) return; // Bloquear clicks si estamos comprobando

            const success = this.gameLogic.flipCard(data.index);
            if (success) {
                this.syncCards();

                if (this.gameLogic.flippedIndices.length === 2) {
                    this.checkTimeout = setTimeout(() => {
                        const isMatch = this.gameLogic.checkMatch();
                        if (isMatch) {
                            const p = this.state.players.get(client.sessionId);
                            if (p) p.score += 10;
                        } else {
                            // Cambiar de turno si falla
                            const sessionIds = Array.from(this.state.players.keys());
                            const nextIndex = sessionIds.indexOf(this.state.currentTurn) === 0 ? 1 : 0;
                            this.state.currentTurn = sessionIds[nextIndex] || this.state.currentTurn;
                        }

                        this.syncCards();
                        
                        if (this.gameLogic.isGameOver()) {
                            this.state.status = "finished";
                        }
                        
                        this.checkTimeout = null;
                    }, 1000); // Dar 1 segundo para ver las cartas
                }
            }
        });
    }

    onJoin(client: Client, options: any) {
        const player = new MemoryPlayer();
        player.name = options.name || `Player_${this.clients.length}`;
        this.state.players.set(client.sessionId, player);

        if (this.clients.length === 2) {
            this.startGame();
        }
    }

    startGame() {
        this.state.status = "playing";
        this.state.currentTurn = this.clients[0].sessionId;
        this.gameLogic = new MemoryGame();
        this.syncCards();
    }

    syncCards() {
        this.state.cards.clear();
        this.gameLogic.cards.forEach(c => {
            const schema = new CardSchema();
            schema.id = c.id;
            // Solo enviamos el valor al cliente si está volteada o emparejada (Anti-trampas)
            schema.value = (c.isFlipped || c.isMatched) ? c.value : "?";
            schema.isFlipped = c.isFlipped;
            schema.isMatched = c.isMatched;
            this.state.cards.push(schema);
        });
    }

    onLeave(client: Client, code?: number) {
        this.state.players.delete(client.sessionId);
        this.state.status = "waiting";
    }
}
