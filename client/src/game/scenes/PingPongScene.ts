import Phaser from "phaser";
import * as Colyseus from "colyseus.js";

export class PingPongScene extends Phaser.Scene {
    private client!: Colyseus.Client;
    private room?: Colyseus.Room;
    private statusText!: Phaser.GameObjects.Text;
    
    // Gráficos
    private ballGraphics!: Phaser.GameObjects.Rectangle;
    private paddle1!: Phaser.GameObjects.Rectangle;
    private paddle2!: Phaser.GameObjects.Rectangle;
    private scoreText!: Phaser.GameObjects.Text;
    
    private myPlayerId: string = "";

    constructor() {
        super({ key: "PingPongScene" });
    }

    create() {
        // Línea central
        this.add.line(400, 400, 0, -400, 0, 400, 0x333333).setLineWidth(4).setStrokeStyle(4, 0x333333, 1);
        
        this.statusText = this.add.text(400, 30, "Conectando...", {
            fontSize: "20px", color: "#00ffff", fontFamily: "monospace"
        }).setOrigin(0.5);

        this.scoreText = this.add.text(400, 100, "0 - 0", {
            fontSize: "64px", color: "#ffffff", fontFamily: "monospace"
        }).setOrigin(0.5);

        this.ballGraphics = this.add.rectangle(400, 400, 15, 15, 0xffffff);
        this.paddle1 = this.add.rectangle(60, 400, 20, 120, 0x00ffff);
        this.paddle2 = this.add.rectangle(740, 400, 20, 120, 0xff00ff);

        this.connectToServer();

        // Enviar posición del mouse para mover la paleta
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.room) {
                // Limitar paleta a los bordes
                let y = pointer.y;
                if (y < 60) y = 60;
                if (y > 740) y = 740;
                this.room.send("move_paddle", { y });
            }
        });
    }

    async connectToServer() {
        try {
            this.client = new Colyseus.Client(
                window.location.hostname === "localhost" 
                ? "ws://localhost:2567" 
                : "wss://tender-rooms-jam.loca.lt"
            );
            
            this.room = await this.client.joinOrCreate("pingpong", { name: "Player" });
            this.myPlayerId = this.room.sessionId;
            
            this.statusText.setText("Esperando rival...");

            this.room.onStateChange((state: any) => {
                if (state.status === "playing") {
                    this.statusText.setText("¡A JUGAR!");
                } else {
                    this.statusText.setText("Esperando rival...");
                }

                // Actualizar Pelota
                this.ballGraphics.setPosition(state.ball.x, state.ball.y);

                // Actualizar Paletas y Score
                const playersArray: any[] = [];
                state.players.forEach((p: any, sessionId: string) => {
                    playersArray.push(p);
                });

                if (playersArray.length > 0) {
                    this.paddle1.y = playersArray[0].paddle.y;
                }
                if (playersArray.length > 1) {
                    this.paddle2.y = playersArray[1].paddle.y;
                    this.scoreText.setText(`${playersArray[0].score} - ${playersArray[1].score}`);
                }
            });
        } catch (e) {
            console.error(e);
            this.statusText.setText("Error de Conexión");
        }
    }
}
