// @ts-nocheck
import { Room, Client } from "@colyseus/core";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { RacingCar } from "../game/RacingRules";

export class CarState extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") rotation: number = 0;
    @type("string") color: string = "0xff0000";
    @type("string") name: string = "";
}

export class RacingState extends Schema {
    @type({ map: CarState }) cars = new MapSchema<CarState>();
}

export class RacingRoom extends Room<RacingState> {
    maxClients = 8;
    private physicsCars = new Map<string, RacingCar>();
    private colors = ["0xff0000", "0x0000ff", "0x00ff00", "0xffff00", "0xff00ff", "0x00ffff", "0xff8800", "0xffffff"];

    onCreate(options: any) {
        this.setState(new RacingState());

        this.onMessage("input", (client, data: any) => {
            const car = this.physicsCars.get(client.sessionId);
            if (car) {
                car.accelerating = data.up;
                car.braking = data.down;
                car.turningLeft = data.left;
                car.turningRight = data.right;
            }
        });

        // Bucle de físicas (60 FPS)
        this.setSimulationInterval((deltaTime) => {
            const dtSec = deltaTime / 1000;
            this.physicsCars.forEach((car, sessionId) => {
                car.update(dtSec);
                
                // Sincronizar con el State
                const stateCar = this.state.cars.get(sessionId);
                if (stateCar) {
                    stateCar.x = car.x;
                    stateCar.y = car.y;
                    stateCar.rotation = car.rotation;
                }
            });
        }, 1000 / 60);
    }

    onJoin(client: Client, options: any) {
        // Posiciones de inicio (Grid)
        const startX = 100 + (this.clients.length % 2) * 100;
        const startY = 1800 + Math.floor(this.clients.length / 2) * 100;

        const pCar = new RacingCar(startX, startY);
        this.physicsCars.set(client.sessionId, pCar);

        const sCar = new CarState();
        sCar.x = pCar.x;
        sCar.y = pCar.y;
        sCar.rotation = pCar.rotation;
        sCar.name = options.name || `Piloto ${this.clients.length}`;
        sCar.color = this.colors[(this.clients.length - 1) % this.colors.length];

        this.state.cars.set(client.sessionId, sCar);
    }

    onLeave(client: Client, code?: number) {
        this.state.cars.delete(client.sessionId);
        this.physicsCars.delete(client.sessionId);
    }
}
