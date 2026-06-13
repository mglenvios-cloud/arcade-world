// @ts-nocheck
import { Room, Client } from "@colyseus/core";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class LobbyPlayer extends Schema {
    @type("string") name: string;
    @type("string") status: string = "online"; // "online", "playing"
    @type("string") game: string = "Hub"; // "Hub", "Truco", "Ajedrez"
}

export class LobbyState extends Schema {
    @type({ map: LobbyPlayer }) players = new MapSchema<LobbyPlayer>();
}

export class LobbyRoom extends Room<any, any> {
    maxClients = 1000;

    onCreate(options: any) {
        this.setState(new LobbyState());
        console.log("LobbyRoom created!");

        this.onMessage("update_status", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                if (data.status) player.status = data.status;
                if (data.game) player.game = data.game;
            }
        });
    }

    onJoin(client: Client, options: any) {
        const player = new LobbyPlayer();
        player.name = options.name || `User_${Math.floor(Math.random() * 1000)}`;
        this.state.players.set(client.sessionId, player);
    }

    onLeave(client: Client, code?: number) {
        this.state.players.delete(client.sessionId);
    }
}
