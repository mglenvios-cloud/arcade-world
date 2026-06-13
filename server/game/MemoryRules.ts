export interface MemoryCard {
    id: number;
    value: string;
    isFlipped: boolean;
    isMatched: boolean;
}

export class MemoryGame {
    public cards: MemoryCard[] = [];
    public flippedIndices: number[] = [];
    public turn: string = "";
    
    constructor() {
        this.initializeCards();
    }

    private initializeCards() {
        const emojis = ["🍎", "🍌", "🍉", "🍇", "🍓", "🍒", "🥝", "🍍"];
        // Duplicar para crear pares
        const pairs = [...emojis, ...emojis];
        
        // Barajar
        pairs.sort(() => 0.5 - Math.random());

        this.cards = pairs.map((val, idx) => ({
            id: idx,
            value: val,
            isFlipped: false,
            isMatched: false
        }));
    }

    flipCard(index: number): boolean {
        const card = this.cards[index];
        if (!card || card.isFlipped || card.isMatched) return false;
        
        // No permitir voltear más de 2
        if (this.flippedIndices.length >= 2) return false;

        card.isFlipped = true;
        this.flippedIndices.push(index);
        
        return true;
    }

    checkMatch(): boolean {
        if (this.flippedIndices.length !== 2) return false;
        
        const card1 = this.cards[this.flippedIndices[0]];
        const card2 = this.cards[this.flippedIndices[1]];
        
        const isMatch = card1.value === card2.value;
        
        if (isMatch) {
            card1.isMatched = true;
            card2.isMatched = true;
        } else {
            card1.isFlipped = false;
            card2.isFlipped = false;
        }
        
        this.flippedIndices = [];
        return isMatch;
    }
    
    isGameOver(): boolean {
        return this.cards.every(c => c.isMatched);
    }
}
