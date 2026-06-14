import Phaser from "phaser";
import * as Colyseus from "colyseus.js";

export class PenalScene extends Phaser.Scene {
    private client!: Colyseus.Client;
    private room?: Colyseus.Room;
    private statusText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private roleText!: Phaser.GameObjects.Text;
    private resultText!: Phaser.GameObjects.Text;
    
    private leftTarget!: Phaser.GameObjects.Rectangle;
    private centerTarget!: Phaser.GameObjects.Rectangle;
    private rightTarget!: Phaser.GameObjects.Rectangle;
    
    private ball!: Phaser.GameObjects.Arc;
    private goalie!: Phaser.GameObjects.Rectangle;

    private myRole: string = "";

    constructor() {
        super({ key: "PenalScene" });
    }

    create() {
        // Dibujar arco
        this.add.rectangle(400, 150, 400, 10, 0xffffff); // Travesaño
        this.add.rectangle(200, 250, 10, 200, 0xffffff); // Poste izq
        this.add.rectangle(600, 250, 10, 200, 0xffffff); // Poste der

        // UI
        this.statusText = this.add.text(400, 30, "Conectando...", { fontSize: "24px", color: "#ffffff" }).setOrigin(0.5);
        this.scoreText = this.add.text(400, 70, "0 - 0", { fontSize: "40px", color: "#ffff00", fontStyle: "bold" }).setOrigin(0.5);
        this.roleText = this.add.text(400, 110, "", { fontSize: "20px", color: "#00ffff" }).setOrigin(0.5);
        this.resultText = this.add.text(400, 300, "", { fontSize: "64px", color: "#ff0000", fontStyle: "bold" }).setOrigin(0.5).setAlpha(0);

        // Pelota
        this.ball = this.add.circle(400, 500, 15, 0xffffff);
        
        // Arquero
        this.goalie = this.add.rectangle(400, 250, 40, 80, 0xff0000);

        // Zonas interactivas
        this.leftTarget = this.createTarget(250, 200, "left");
        this.centerTarget = this.createTarget(400, 200, "center");
        this.rightTarget = this.createTarget(550, 200, "right");

        this.connectToServer();
    }

    createTarget(x: number, y: number, position: string) {
        const target = this.add.rectangle(x, y, 100, 100, 0x000000, 0.3)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.selectPosition(position))
            .on("pointerover", () => target.setFillStyle(0xffff00, 0.5))
            .on("pointerout", () => target.setFillStyle(0x000000, 0.3));
        return target;
    }

    selectPosition(position: string) {
        if (this.room) {
            this.room.send("select_position", { position });
            this.statusText.setText("Selección enviada. Esperando...");
        }
    }

    async connectToServer() {
        try {
            this.client = new Colyseus.Client(
                window.location.hostname === "localhost" 
                ? "ws://localhost:2567" 
                : "wss://tender-rooms-jam.loca.lt"
            );
            
            this.room = await this.client.joinOrCreate("penales", { name: "Player" });
            
            this.room.onStateChange((state: any) => {
                const myPlayer = state.players[this.room!.sessionId];
                if (myPlayer) {
                    this.myRole = myPlayer.role;
                    this.roleText.setText(`Eres: ${this.myRole === "kicker" ? "Pateador" : "Arquero"}`);
                }

                if (state.status === "waiting") {
                    this.statusText.setText("Esperando rival...");
                } else if (state.status === "playing") {
                    this.statusText.setText(`Ronda ${state.round} - ¡Elige hacia dónde ${this.myRole === "kicker" ? "patear" : "tirarte"}!`);
                    
                    // Resetear posiciones
                    this.tweens.add({
                        targets: this.ball, x: 400, y: 500, duration: 500, ease: 'Power2'
                    });
                    this.tweens.add({
                        targets: this.goalie, x: 400, y: 250, duration: 500, ease: 'Power2'
                    });
                    this.resultText.setAlpha(0);

                    // Actualizar scores
                    const playersArray = [];
                    state.players.forEach((p: any) => playersArray.push(p));
                    if(playersArray.length === 2) {
                        this.scoreText.setText(`${playersArray[0].score} - ${playersArray[1].score}`);
                    }

                } else if (state.status === "resolved") {
                    this.animateResult(state.kickerPos, state.goaliePos, state.lastResult);
                } else if (state.status === "finished") {
                    this.statusText.setText("¡TANDA DE PENALES TERMINADA!");
                }
            });
        } catch (e) {
            console.error(e);
            this.statusText.setText("Error de Conexión");
        }
    }

    animateResult(kickerPos: string, goaliePos: string, result: string) {
        const getX = (pos: string) => {
            if (pos === "left") return 250;
            if (pos === "right") return 550;
            return 400;
        };

        // Animar pelota
        this.tweens.add({
            targets: this.ball,
            x: getX(kickerPos),
            y: 200,
            duration: 600,
            ease: 'Power2'
        });

        // Animar arquero
        this.tweens.add({
            targets: this.goalie,
            x: getX(goaliePos),
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.resultText.setText(result === "goal" ? "¡GOL!" : "¡ATAJADA!");
                this.resultText.setColor(result === "goal" ? "#00ff00" : "#ff0000");
                this.tweens.add({
                    targets: this.resultText,
                    alpha: 1,
                    scale: { from: 0.5, to: 1.5 },
                    duration: 500,
                    yoyo: true,
                    hold: 1500
                });
            }
        });
    }
}
