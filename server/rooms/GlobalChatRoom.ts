// @ts-nocheck
import { Room, Client } from "@colyseus/core";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("string") name: string;
    @type("string") avatar: string;
}

export class ChatState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
}

export class GlobalChatRoom extends Room<any, any> {
    maxClients = 100;

    onCreate(options: any) {
        this.setState(new ChatState());

        this.onMessage("chat", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            this.broadcast("chat", { sender: player?.name || "Guest", message });
        });
    }

    onJoin(client: Client, options: any) {
        const player = new Player();
        player.name = options.name || `User_${Math.floor(Math.random() * 1000)}`;
        player.avatar = options.avatar || "default";
        this.state.players.set(client.sessionId, player);

        this.broadcast("system", `${player.name} joined the global chat.`);
    }

    onLeave(client: Client, code?: number) {
        const player = this.state.players.get(client.sessionId);
        if (player) {
            this.broadcast("system", `${player.name} left the global chat.`);
            this.state.players.delete(client.sessionId);
        }
    }

    onDispose() {
        console.log("GlobalChatRoom disposing...");
    }
}

