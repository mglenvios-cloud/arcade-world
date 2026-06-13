// @ts-nocheck
import { Room, Client } from "@colyseus/core";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { createDeck, dealCards, Card as GameCard } from "../game/Deck";

export class Card extends Schema {
    @type("string") suit: string; // "espada", "basto", "oro", "copa"
    @type("number") value: number;
    @type("number") weight: number; // Jerarquía para el truco
}

export class TrucoPlayer extends Schema {
    @type("string") name: string;
    @type([ Card ]) hand = new ArraySchema<Card>();
    @type("boolean") connected: boolean = true;
    @type("number") team: number; // 0 o 1
}

export class TrucoState extends Schema {
    @type({ map: TrucoPlayer }) players = new MapSchema<TrucoPlayer>();
    @type("string") currentTurn: string;
    @type("number") round: number = 1;
    @type("number") teamA_Score: number = 0;
    @type("number") teamB_Score: number = 0;
    @type("string") status: string = "waiting"; // "waiting", "playing", "finished"
}

export class TrucoRoom extends Room<any, any> {
    maxClients = 2; // MVP: 1 vs 1
    private deck: GameCard[] = [];

    onCreate(options: any) {
        this.setState(new TrucoState());
        
        this.onMessage("play_card", (client, message) => {
            // Lógica para jugar carta
        });
        
        this.onMessage("call_truco", (client, message) => {
            // Lógica para cantar truco
        });
    }

    onJoin(client: Client, options: any) {
        const player = new TrucoPlayer();
        player.name = options.name || `Player_${client.sessionId}`;
        
        // Assign team
        player.team = this.clients.length === 1 ? 0 : 1;
        
        this.state.players.set(client.sessionId, player);
        console.log(`${player.name} joined Truco Room`);

        if (this.clients.length === this.maxClients) {
            this.startGame();
        }
    }
    
    startGame() {
        console.log("Truco game starting...");
        this.state.status = "playing";
        
        this.deck = createDeck();
        const { hands, remainingDeck } = dealCards(this.deck, this.maxClients);
        this.deck = remainingDeck;

        // Asignar cartas a cada jugador
        let i = 0;
        this.state.players.forEach((player, sessionId) => {
            player.hand.clear();
            for (const c of hands[i]) {
                const schemaCard = new Card();
                schemaCard.suit = c.suit;
                schemaCard.value = c.value;
                schemaCard.weight = c.weight;
                player.hand.push(schemaCard);
            }
            // MVP: Turno del primer jugador
            if (i === 0) this.state.currentTurn = sessionId;
            i++;
        });
    }

    onLeave(client: Client, code?: number) {
        const player = this.state.players.get(client.sessionId);
        if (player) {
            player.connected = false;
            console.log(`${player.name} left Truco Room`);
        }
    }

    onDispose() {
        console.log("TrucoRoom disposing...");
    }
}

