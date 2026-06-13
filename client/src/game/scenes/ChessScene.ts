import Phaser from "phaser";
import * as Colyseus from "colyseus.js";

const TILE_SIZE = 100;
const PIECES_UNICODE: Record<string, string> = {
    "wp": "♙", "wn": "♘", "wb": "♗", "wr": "♖", "wq": "♕", "wk": "♔",
    "bp": "♟", "bn": "♞", "bb": "♝", "br": "♜", "bq": "♛", "bk": "♚"
};

export class ChessScene extends Phaser.Scene {
    private client!: Colyseus.Client;
    private room?: Colyseus.Room;
    private statusText!: Phaser.GameObjects.Text;
    private piecesGroup!: Phaser.GameObjects.Group;
    private myColor: string = "";
    private selectedPiece: any = null;

    constructor() {
        super({ key: "ChessScene" });
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
                const color = isLight ? 0xf0d9b5 : 0xb58863;
                
                const rect = this.add.rectangle(
                    col * TILE_SIZE + TILE_SIZE / 2, 
                    row * TILE_SIZE + TILE_SIZE / 2 + 60, // offset Y para el texto de arriba
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
            this.client = new Colyseus.Client("wss://tender-rooms-jam.loca.lt");
            this.room = await this.client.joinOrCreate("chess", { name: "Player" });
            
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
            this.statusText.setText("Error de Conexión");
        }
    }

    renderPieces(boardArray: string[]) {
        this.piecesGroup.clear(true, true);

        let i = 0;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const pieceStr = boardArray[i];
                if (pieceStr) {
                    const text = this.add.text(
                        x * TILE_SIZE + TILE_SIZE / 2,
                        y * TILE_SIZE + TILE_SIZE / 2 + 60,
                        PIECES_UNICODE[pieceStr] || "?",
                        { fontSize: "64px", color: pieceStr.startsWith("w") ? "#ffffff" : "#000000" }
                    ).setOrigin(0.5);

                    // Drop shadow for better visibility
                    text.setShadow(2, 2, 'rgba(0,0,0,0.5)', 2);

                    if (pieceStr.startsWith(this.myColor)) {
                        text.setInteractive({ useHandCursor: true });
                        text.on("pointerdown", () => this.selectPiece(x, y, text));
                    }
                    this.piecesGroup.add(text);
                }
                i++;
            }
        }
    }

    selectPiece(x: number, y: number, textObj: Phaser.GameObjects.Text) {
        // Deseleccionar anterior
        if (this.selectedPiece) {
            this.selectedPiece.textObj.setAlpha(1);
        }

        this.selectedPiece = { x, y, textObj };
        textObj.setAlpha(0.5); // Visual feedback
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
