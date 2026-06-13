import Phaser from "phaser";
import * as Colyseus from "colyseus.js";

const TILE_SIZE = 100;

export class CheckersScene extends Phaser.Scene {
    private client!: Colyseus.Client;
    private room?: Colyseus.Room;
    private statusText!: Phaser.GameObjects.Text;
    private piecesGroup!: Phaser.GameObjects.Group;
    private myColor: string = "";
    private selectedPiece: any = null;

    constructor() {
        super({ key: "CheckersScene" });
    }

    create() {
        this.statusText = this.add.text(400, 30, "Conectando al Servidor...", {
            fontSize: "24px", color: "#ffffff", fontStyle: "bold"
        }).setOrigin(0.5);

        this.drawBoard();
        this.piecesGroup = this.add.group();

        this.connectToServer();
    }

    drawBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const isLight = (row + col) % 2 === 0;
                // Colores clásicos de damas (rojo/negro o madera)
                const color = isLight ? 0xffce9e : 0xd18b47;
                
                const rect = this.add.rectangle(
                    col * TILE_SIZE + TILE_SIZE / 2, 
                    row * TILE_SIZE + TILE_SIZE / 2 + 60, 
                    TILE_SIZE, 
                    TILE_SIZE, 
                    color
                );
                
                rect.setInteractive();
                rect.on("pointerdown", () => this.onTileClick(col, row));
            }
        }
    }

    async connectToServer() {
        try {
            // Usamos localtunnel o localhost dependiendo de dónde se corra
            this.client = new Colyseus.Client("wss://tender-rooms-jam.loca.lt");
            this.room = await this.client.joinOrCreate("checkers", { name: "Player" });
            
            this.statusText.setText("Esperando rival...");

            this.room.onStateChange((state: any) => {
                const myPlayer = state.players[this.room!.sessionId];
                if (myPlayer) this.myColor = myPlayer.color;
                
                if (Object.keys(state.players).length === 2) {
                    this.statusText.setText(`Turno: ${state.currentTurn === "w" ? "Blancas" : "Negras"} | Eres: ${this.myColor === "w" ? "Blancas" : "Negras"}`);
                }

                this.renderPieces(state.board);
            });
        } catch (e) {
            console.error(e);
            // Fallback a localhost si falla el wss
            try {
                this.client = new Colyseus.Client("ws://localhost:2567");
                this.room = await this.client.joinOrCreate("checkers", { name: "Player" });
                this.statusText.setText("Conectado localmente...");
                this.room.onStateChange((state: any) => {
                    const myPlayer = state.players[this.room!.sessionId];
                    if (myPlayer) this.myColor = myPlayer.color;
                    this.renderPieces(state.board);
                });
            } catch(e2) {
                this.statusText.setText("Error de Conexión");
            }
        }
    }

    renderPieces(boardArray: string[]) {
        this.piecesGroup.clear(true, true);

        let i = 0;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const pieceStr = boardArray[i]; // ej: "w_man"
                if (pieceStr) {
                    const [color, type] = pieceStr.split("_");
                    const pieceColor = color === "w" ? 0xeeeeee : 0x222222;

                    const circle = this.add.circle(
                        x * TILE_SIZE + TILE_SIZE / 2,
                        y * TILE_SIZE + TILE_SIZE / 2 + 60,
                        35,
                        pieceColor
                    );

                    circle.setStrokeStyle(4, color === "w" ? 0xcccccc : 0x000000);

                    // Si es Reina/King, añadir una corona
                    if (type === "king") {
                        const crown = this.add.text(
                            x * TILE_SIZE + TILE_SIZE / 2,
                            y * TILE_SIZE + TILE_SIZE / 2 + 60,
                            "👑",
                            { fontSize: "32px" }
                        ).setOrigin(0.5);
                        this.piecesGroup.add(crown);
                    }

                    if (color === this.myColor) {
                        circle.setInteractive({ useHandCursor: true });
                        circle.on("pointerdown", () => this.selectPiece(x, y, circle));
                    }
                    
                    this.piecesGroup.add(circle);
                }
                i++;
            }
        }
    }

    selectPiece(x: number, y: number, circleObj: Phaser.GameObjects.Arc) {
        if (this.selectedPiece) {
            this.selectedPiece.circleObj.setAlpha(1);
        }

        this.selectedPiece = { x, y, circleObj };
        circleObj.setAlpha(0.5); // Visual feedback
    }

    onTileClick(x: number, y: number) {
        if (this.selectedPiece && this.room) {
            this.room.send("move", {
                fromX: this.selectedPiece.x,
                fromY: this.selectedPiece.y,
                toX: x,
                toY: y
            });
            this.selectedPiece = null;
        }
    }
}
