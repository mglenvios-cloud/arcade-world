// @ts-nocheck
import { Room, Client } from "@colyseus/core";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { PenalGame, Position } from "../game/PenalRules";

export class PenalPlayer extends Schema {
    @type("string") name: string;
    @type("number") score: number = 0;
    @type("string") role: string; // "kicker" | "goalkeeper"
    @type("boolean") hasSelected: boolean = false;
}

export class PenalState extends Schema {
    @type({ map: PenalPlayer }) players = new MapSchema<PenalPlayer>();
    @type("string") status: string = "waiting"; // waiting, playing, resolved, finished
    @type("string") lastResult: string = ""; // "goal", "saved"
    @type("string") kickerPos: string = ""; // Para mostrar la animación
    @type("string") goaliePos: string = ""; // Para mostrar la animación
    @type("number") round: number = 1;
}

export class PenalRoom extends Room<any, any> {
    maxClients = 2;
    private gameLogic: PenalGame;

    onCreate(options: any) {
        this.setState(new PenalState());

        this.onMessage("select_position", (client, data: { position: Position }) => {
            if (this.state.status !== "playing") return;

            const player = this.state.players.get(client.sessionId);
            if (!player || player.hasSelected) return;

            if (player.role === "kicker") {
                this.gameLogic.kickerSelection = data.position;
            } else {
                this.gameLogic.goalkeeperSelection = data.position;
            }
            player.hasSelected = true;

            const result = this.gameLogic.resolveTurn();
            if (result) {
                // Ambos seleccionaron, mostrar animación
                this.state.status = "resolved";
                this.state.lastResult = result.isGoal ? "goal" : "saved";
                this.state.kickerPos = this.gameLogic.kickerSelection!;
                this.state.goaliePos = this.gameLogic.goalkeeperSelection!;

                // Sincronizar puntajes
                const playersArray = Array.from(this.state.players.values());
                playersArray[0].score = this.gameLogic.p1Score;
                playersArray[1].score = this.gameLogic.p2Score;

                setTimeout(() => {
                    if (result.finished) {
                        this.state.status = "finished";
                    } else {
                        // Iniciar siguiente turno
                        playersArray[0].role = this.gameLogic.p1Role;
                        playersArray[1].role = this.gameLogic.p2Role;
                        playersArray[0].hasSelected = false;
                        playersArray[1].hasSelected = false;
                        this.state.round = this.gameLogic.roundCount;
                        this.state.status = "playing";
                        this.state.kickerPos = "";
                        this.state.goaliePos = "";
                        this.state.lastResult = "";
                    }
                }, 3000); // 3 segundos de animación
            }
        });
    }

    onJoin(client: Client, options: any) {
        const player = new PenalPlayer();
        player.name = options.name || `Jugador_${this.clients.length}`;
        player.role = this.clients.length === 1 ? "kicker" : "goalkeeper";
        this.state.players.set(client.sessionId, player);

        if (this.clients.length === 2) {
            this.gameLogic = new PenalGame();
            this.state.status = "playing";
        }
    }

    onLeave(client: Client, code?: number) {
        this.state.players.delete(client.sessionId);
        this.state.status = "waiting";
    }
}
