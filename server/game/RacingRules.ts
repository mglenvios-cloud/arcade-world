export class RacingCar {
    public x: number;
    public y: number;
    public rotation: number = 0; // en radianes
    public speed: number = 0;
    
    // Inputs
    public accelerating: boolean = false;
    public braking: boolean = false;
    public turningLeft: boolean = false;
    public turningRight: boolean = false;

    // Constantes físicas
    private maxSpeed: number = 400; // px/seg
    private acceleration: number = 600;
    private friction: number = 200;
    private turnSpeed: number = 3; // radianes/seg

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.rotation = -Math.PI / 2; // Apuntar hacia arriba
    }

    update(deltaTime: number) { // deltaTime en segundos
        // Aceleración
        if (this.accelerating) {
            this.speed += this.acceleration * deltaTime;
        } else if (this.braking) {
            this.speed -= this.acceleration * deltaTime;
        } else {
            // Fricción
            if (this.speed > 0) {
                this.speed -= this.friction * deltaTime;
                if (this.speed < 0) this.speed = 0;
            } else if (this.speed < 0) {
                this.speed += this.friction * deltaTime;
                if (this.speed > 0) this.speed = 0;
            }
        }

        // Limitar velocidad
        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        if (this.speed < -this.maxSpeed / 2) this.speed = -this.maxSpeed / 2; // Reversa es más lenta

        // Rotación (solo se puede girar si hay velocidad)
        if (Math.abs(this.speed) > 10) {
            const turnMultiplier = this.speed > 0 ? 1 : -1; // Al ir en reversa, el giro se invierte
            if (this.turningLeft) {
                this.rotation -= this.turnSpeed * deltaTime * turnMultiplier;
            }
            if (this.turningRight) {
                this.rotation += this.turnSpeed * deltaTime * turnMultiplier;
            }
        }

        // Movimiento
        this.x += Math.cos(this.rotation) * this.speed * deltaTime;
        this.y += Math.sin(this.rotation) * this.speed * deltaTime;

        // Mantener dentro de un mapa gigante (2000x2000)
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x > 2000) this.x = 2000;
        if (this.y > 2000) this.y = 2000;
    }
}
