import Phaser from "phaser";
import * as Colyseus from "colyseus.js";

export class RacingScene extends Phaser.Scene {
    private client!: Colyseus.Client;
    private room?: Colyseus.Room;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private cars: { [sessionId: string]: Phaser.GameObjects.Rectangle } = {};
    private myCarId: string = "";
    
    // UI
    private statusText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: "RacingScene" });
    }

    create() {
        // Pista gigante (2000x2000)
        this.cameras.main.setBounds(0, 0, 2000, 2000);
        this.physics.world.setBounds(0, 0, 2000, 2000);
        
        // Dibujar cuadricula de fondo para notar el movimiento
        this.add.grid(1000, 1000, 2000, 2000, 100, 100, 0x333333).setAltFillStyle(0x2b2b2b).setOutlineStyle();

        // UI Fija en pantalla
        this.statusText = this.add.text(400, 30, "Conectando...", { fontSize: "20px", color: "#ffffff" })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(100);

        // Teclado
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        this.connectToServer();
    }

    async connectToServer() {
        try {
            this.client = new Colyseus.Client(
                window.location.hostname === "localhost" 
                ? "ws://localhost:2567" 
                : "wss://tender-rooms-jam.loca.lt"
            );
            
            this.room = await this.client.joinOrCreate("racing", { name: "Piloto" });
            this.myCarId = this.room.sessionId;
            this.statusText.setText("¡Usa las flechas del teclado para conducir!");

            this.room.state.cars.onAdd((car: any, sessionId: string) => {
                // Crear sprite del auto (un simple rectangulo por ahora)
                const isMe = sessionId === this.myCarId;
                const rect = this.add.rectangle(car.x, car.y, 40, 20, parseInt(car.color, 16));
                
                // Indicador frontal (para saber hacia donde mira)
                const front = this.add.rectangle(15, 0, 10, 10, 0xffffff);
                const container = this.add.container(car.x, car.y, [rect, front]);
                
                if (isMe) {
                    this.cameras.main.startFollow(container, true, 0.1, 0.1);
                    this.cameras.main.setZoom(1.5);
                }

                // Guardar la referencia al contenedor hackeando un poco el tipo Rectangle a Container para el map
                this.cars[sessionId] = container as unknown as Phaser.GameObjects.Rectangle;

                // Escuchar cambios
                car.onChange(() => {
                    const c = this.cars[sessionId];
                    if (c) {
                        c.x = car.x;
                        c.y = car.y;
                        c.rotation = car.rotation;
                    }
                });
            });

            this.room.state.cars.onRemove((car: any, sessionId: string) => {
                const c = this.cars[sessionId];
                if (c) {
                    c.destroy();
                    delete this.cars[sessionId];
                }
            });

        } catch (e) {
            console.error(e);
            this.statusText.setText("Error de Conexión");
        }
    }

    update() {
        if (!this.room || !this.cursors) return;

        // Enviar inputs al servidor continuamente
        const input = {
            up: this.cursors.up.isDown,
            down: this.cursors.down.isDown,
            left: this.cursors.left.isDown,
            right: this.cursors.right.isDown,
        };

        this.room.send("input", input);
    }
}
