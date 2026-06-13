// @ts-nocheck
import { Room, Client } from "@colyseus/core";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { TriviaGame } from "../game/TriviaRules";

export class TriviaPlayer extends Schema {
    @type("string") name: string;
    @type("number") score: number = 0;
    @type("boolean") hasAnswered: boolean = false;
}

export class TriviaState extends Schema {
    @type({ map: TriviaPlayer }) players = new MapSchema<TriviaPlayer>();
    @type("string") status: string = "waiting"; // waiting, playing, finished
    @type("string") questionText: string = "";
    @type(["string"]) options = new ArraySchema<string>();
    @type("number") timeLeft: number = 10;
}

export class TriviaRoom extends Room<any, any> {
    maxClients = 4; // Hasta 4 jugadores a la vez
    private gameLogic: TriviaGame;
    private timerInterval: any;

    onCreate(options: any) {
        this.setState(new TriviaState());

        this.onMessage("answer", (client, data) => {
            if (this.state.status !== "playing") return;
            
            const player = this.state.players.get(client.sessionId);
            if (player && !player.hasAnswered) {
                player.hasAnswered = true;
                const isCorrect = this.gameLogic.checkAnswer(data.answerIndex);
                if (isCorrect) {
                    player.score += 10 * this.state.timeLeft; // Más puntos si responde rápido
                }
                
                this.checkRoundEnd();
            }
        });
    }

    onJoin(client: Client, options: any) {
        const player = new TriviaPlayer();
        player.name = options.name || `Jugador_${Math.floor(Math.random() * 1000)}`;
        this.state.players.set(client.sessionId, player);

        if (this.clients.length === 2 && this.state.status === "waiting") {
            // Iniciar el juego con 2 o más jugadores
            this.startGame();
        }
    }

    startGame() {
        this.state.status = "playing";
        this.gameLogic = new TriviaGame();
        this.sendNextQuestion();
    }

    sendNextQuestion() {
        if (this.gameLogic.isGameOver()) {
            this.state.status = "finished";
            if(this.timerInterval) clearInterval(this.timerInterval);
            return;
        }

        const q = this.gameLogic.getCurrentQuestion();
        this.state.questionText = q.text;
        
        this.state.options.clear();
        q.options.forEach(opt => this.state.options.push(opt));
        
        this.state.timeLeft = 10; // 10 segundos por pregunta

        // Resetear a los jugadores
        this.state.players.forEach(p => p.hasAnswered = false);

        if(this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            this.state.timeLeft--;
            if (this.state.timeLeft <= 0) {
                this.gameLogic.nextQuestion();
                this.sendNextQuestion();
            }
        }, 1000);
    }

    checkRoundEnd() {
        let allAnswered = true;
        this.state.players.forEach(p => {
            if (!p.hasAnswered) allAnswered = false;
        });

        if (allAnswered) {
            this.gameLogic.nextQuestion();
            this.sendNextQuestion();
        }
    }

    onLeave(client: Client, code?: number) {
        this.state.players.delete(client.sessionId);
        if (this.clients.length === 0 && this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
}
