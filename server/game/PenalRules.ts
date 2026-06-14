export type Role = "kicker" | "goalkeeper";
export type Position = "left" | "center" | "right";

export class PenalGame {
    public p1Role: Role = "kicker";
    public p2Role: Role = "goalkeeper";
    
    public p1Score: number = 0;
    public p2Score: number = 0;

    public roundCount: number = 1;
    public maxRounds: number = 5;

    public kickerSelection: Position | null = null;
    public goalkeeperSelection: Position | null = null;

    // Retorna true si ambos ya seleccionaron y el turno se resolvió
    resolveTurn(): { isGoal: boolean, finished: boolean } | null {
        if (!this.kickerSelection || !this.goalkeeperSelection) return null;

        const isGoal = this.kickerSelection !== this.goalkeeperSelection;

        if (this.p1Role === "kicker" && isGoal) this.p1Score++;
        if (this.p2Role === "kicker" && isGoal) this.p2Score++;

        // Intercambiar roles
        const temp = this.p1Role;
        this.p1Role = this.p2Role;
        this.p2Role = temp;

        this.kickerSelection = null;
        this.goalkeeperSelection = null;

        // Cada 2 tiros es una ronda completa
        let finished = false;
        if (this.p1Role === "kicker") {
            this.roundCount++;
            if (this.roundCount > this.maxRounds) {
                finished = true;
            }
        }

        return { isGoal, finished };
    }
}
