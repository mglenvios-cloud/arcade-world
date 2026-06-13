// @ts-nocheck
import { Room, Client } from "@colyseus/core";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Paddle extends Schema {
    @type("number") y: number = 400;
}

export class Ball extends Schema {
    @type("number") x: number = 400;
    @type("number") y: number = 400;
}

export class PingPongPlayer extends Schema {
    @type("string") name: string;
    @type("number") score: number = 0;
    @type(Paddle) paddle = new Paddle();
}

export class PingPongState extends Schema {
    @type({ map: PingPongPlayer }) players = new MapSchema<PingPongPlayer>();
    @type(Ball) ball = new Ball();
    @type("string") status: string = "waiting"; // waiting, playing
}

export class PingPongRoom extends Room<any, any> {
    maxClients = 2;
    private gameLoop: any;
    private ballSpeedX = 5;
    private ballSpeedY = 5;

    onCreate(options: any) {
        this.setState(new PingPongState());
        
        // El servidor actualiza el juego 60 veces por segundo
        this.setSimulationInterval((deltaTime) => this.update(deltaTime), 1000 / 60);

        this.onMessage("move_paddle", (client, data) => {
            if (this.state.status === "playing") {
                const player = this.state.players.get(client.sessionId);
                if (player) {
                    player.paddle.y = data.y; // El cliente manda la posición Y de su mouse
                }
            }
        });
    }

    onJoin(client: Client, options: any) {
        const player = new PingPongPlayer();
        player.name = options.name || `Player_${client.sessionId}`;
        
        // Poner la paleta inicial según el jugador (1 izquierda, 2 derecha)
        this.state.players.set(client.sessionId, player);

        if (this.clients.length === 2 && this.state.status === "waiting") {
            this.state.status = "playing";
            this.resetBall();
        }
    }

    update(deltaTime: number) {
        if (this.state.status !== "playing") return;

        // Mover la pelota
        this.state.ball.x += this.ballSpeedX;
        this.state.ball.y += this.ballSpeedY;

        // Rebote en pared superior e inferior (Alto: 800)
        if (this.state.ball.y <= 10 || this.state.ball.y >= 790) {
            this.ballSpeedY *= -1;
        }

        // Detección de colisiones con paletas (Ancho: 800)
        const playersArray = Array.from(this.state.players.values());
        if (playersArray.length === 2) {
            const p1 = playersArray[0]; // Izquierda (x=50)
            const p2 = playersArray[1]; // Derecha (x=750)

            // Colisión Paleta Izquierda
            if (this.state.ball.x <= 70 && this.state.ball.x >= 50 && 
                Math.abs(this.state.ball.y - p1.paddle.y) < 60) {
                this.ballSpeedX = Math.abs(this.ballSpeedX); // Rebote hacia la derecha
            }

            // Colisión Paleta Derecha
            if (this.state.ball.x >= 730 && this.state.ball.x <= 750 && 
                Math.abs(this.state.ball.y - p2.paddle.y) < 60) {
                this.ballSpeedX = -Math.abs(this.ballSpeedX); // Rebote hacia la izquierda
            }

            // Goles
            if (this.state.ball.x < 0) {
                p2.score++;
                this.resetBall();
            } else if (this.state.ball.x > 800) {
                p1.score++;
                this.resetBall();
            }
        }
    }

    resetBall() {
        this.state.ball.x = 400;
        this.state.ball.y = 400;
        // Lanzar hacia un lado aleatorio
        this.ballSpeedX = (Math.random() > 0.5 ? 5 : -5);
        this.ballSpeedY = (Math.random() > 0.5 ? 5 : -5);
    }

    onLeave(client: Client, code?: number) {
        this.state.players.delete(client.sessionId);
        this.state.status = "waiting";
    }
}
