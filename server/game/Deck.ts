export interface Card {
    suit: "espada" | "basto" | "oro" | "copa";
    value: number;
    weight: number; // Mayor peso = mayor jerarquía en el truco
}

// Jerarquía de cartas del Truco Argentino (de mayor a menor)
const TRUCO_HIERARCHY: Record<string, number> = {
    "espada_1": 14,
    "basto_1": 13,
    "espada_7": 12,
    "oro_7": 11,
    "3": 10,
    "2": 9,
    "copa_1": 8,
    "oro_1": 8,
    "12": 7,
    "11": 6,
    "10": 5,
    "basto_7": 4,
    "copa_7": 4,
    "6": 3,
    "5": 2,
    "4": 1
};

export function getCardWeight(suit: string, value: number): number {
    const specificKey = `${suit}_${value}`;
    if (TRUCO_HIERARCHY[specificKey] !== undefined) {
        return TRUCO_HIERARCHY[specificKey];
    }
    return TRUCO_HIERARCHY[`${value}`] || 0;
}

export function createDeck(): Card[] {
    const suits: ("espada" | "basto" | "oro" | "copa")[] = ["espada", "basto", "oro", "copa"];
    const values = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
    const deck: Card[] = [];

    for (const suit of suits) {
        for (const value of values) {
            deck.push({
                suit,
                value,
                weight: getCardWeight(suit, value)
            });
        }
    }

    return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
}

export function dealCards(deck: Card[], numPlayers: number): { hands: Card[][], remainingDeck: Card[] } {
    let currentDeck = shuffleDeck(deck);
    const hands: Card[][] = Array.from({ length: numPlayers }, () => []);

    // Se reparten 3 cartas por jugador (MVP)
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < numPlayers; j++) {
            hands[j].push(currentDeck.pop()!);
        }
    }

    return { hands, remainingDeck: currentDeck };
}
