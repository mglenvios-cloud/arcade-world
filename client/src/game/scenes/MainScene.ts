import Phaser from "phaser";
import * as Colyseus from "colyseus.js";

export class MainScene extends Phaser.Scene {
    private client!: Colyseus.Client;
    private room?: Colyseus.Room;
    private statusText!: Phaser.GameObjects.Text;
    private cardsGroup!: Phaser.GameObjects.Group;

    constructor() {
        super({ key: "MainScene" });
    }

    preload() {
        // En un proyecto real cargaríamos spritesheets aquí.
        // Por ahora usaremos gráficos básicos dibujados por Phaser para representar cartas
    }

    async create() {
        // Texto de Estado
        this.statusText = this.add.text(400, 300, "Conectando al Servidor...", {
            fontSize: "24px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.cardsGroup = this.add.group();

        try {
            // Conectar al servidor Colyseus
            this.client = new Colyseus.Client("wss://tender-rooms-jam.loca.lt");
            this.room = await this.client.joinOrCreate("truco", { name: "JugadorWeb" });
            
            this.statusText.setText("Conectado! Esperando rival...");

            // Escuchar cambios de estado
            this.room.onStateChange((state: any) => {
                this.updateTable(state);
            });

            this.room.onMessage("system", (message) => {
                console.log("Mensaje de sistema:", message);
            });

        } catch (e) {
            console.error("Error de conexión:", e);
            this.statusText.setText("Error de Conexión. Servidor apagado?");
            this.statusText.setColor("#ff0000");
        }
    }

    updateTable(state: any) {
        if (state.status === "playing") {
            this.statusText.setText(`¡Partida Iniciada! Turno de: ${state.currentTurn === this.room?.sessionId ? 'TUYO' : 'Rival'}`);
            this.statusText.setPosition(400, 50);

            // Dibujar cartas del jugador actual
            this.cardsGroup.clear(true, true);
            
            const myPlayer = state.players[this.room!.sessionId];
            if (myPlayer && myPlayer.hand) {
                const handSize = myPlayer.hand.length;
                const startX = 400 - ((handSize - 1) * 100) / 2;
                
                myPlayer.hand.forEach((card: any, index: number) => {
                    this.drawCard(startX + (index * 100), 500, card);
                });
            }
            
            // Dibujar reverso de cartas del rival (MVP: 1v1)
            let enemyIndex = 0;
            for (let id in state.players) {
                if (id !== this.room!.sessionId) {
                    const enemyPlayer = state.players[id];
                    if (enemyPlayer.hand) {
                        const handSize = enemyPlayer.hand.length;
                        const startX = 400 - ((handSize - 1) * 100) / 2;
                        for(let i=0; i < handSize; i++) {
                            this.drawCardBack(startX + (i * 100), 100);
                        }
                    }
                }
            }
        }
    }

    drawCard(x: number, y: number, cardData: any) {
        // Dibujo de carta temporal (Placeholder visual 2D)
        const rect = this.add.rectangle(x, y, 80, 120, 0xffffff).setStrokeStyle(2, 0x000000);
        const text = this.add.text(x, y, `${cardData.value}\n${cardData.suit}`, {
            color: "#000000",
            align: "center",
            fontSize: "16px",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Hacer la carta interactiva
        rect.setInteractive({ useHandCursor: true });
        rect.on('pointerdown', () => {
            if (this.room) {
                // this.room.send("play_card", { /* datos */ });
                // Animación temporal
                this.tweens.add({
                    targets: [rect, text],
                    y: 300,
                    duration: 300,
                    ease: 'Power2'
                });
            }
        });
        
        rect.on('pointerover', () => rect.setY(y - 20));
        rect.on('pointerout', () => rect.setY(y));

        this.cardsGroup.add(rect);
        this.cardsGroup.add(text);
    }
    
    drawCardBack(x: number, y: number) {
        const rect = this.add.rectangle(x, y, 80, 120, 0x1e40af).setStrokeStyle(2, 0xffffff); // Azul oscuro
        const text = this.add.text(x, y, `?`, { color: "#ffffff", fontSize: "32px", fontStyle: "bold" }).setOrigin(0.5);
        this.cardsGroup.add(rect);
        this.cardsGroup.add(text);
    }
}
