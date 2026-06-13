export interface Question {
    id: number;
    text: string;
    options: string[];
    correctIndex: number;
}

export const QUESTIONS_DB: Question[] = [
    { id: 1, text: "¿En qué año se lanzó la primera consola PlayStation?", options: ["1992", "1994", "1996", "1998"], correctIndex: 1 },
    { id: 2, text: "¿Cuál es el juego más vendido de la historia?", options: ["Minecraft", "Tetris", "GTA V", "Super Mario Bros"], correctIndex: 0 },
    { id: 3, text: "¿Cómo se llama el protagonista de la saga The Legend of Zelda?", options: ["Zelda", "Luigi", "Link", "Ganon"], correctIndex: 2 },
    { id: 4, text: "¿Qué compañía desarrolló el juego Pac-Man?", options: ["Nintendo", "Namco", "Sega", "Atari"], correctIndex: 1 },
    { id: 5, text: "¿Cuál es el nombre del creador de Super Mario?", options: ["Hideo Kojima", "Shigeru Miyamoto", "Satoru Iwata", "Shinji Mikami"], correctIndex: 1 },
];

export class TriviaGame {
    public currentQuestionIndex: number = 0;
    private questions: Question[] = [];

    constructor() {
        // Seleccionar 3 preguntas al azar para la partida
        this.questions = [...QUESTIONS_DB].sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    getCurrentQuestion(): Question | null {
        if (this.currentQuestionIndex >= this.questions.length) return null;
        return this.questions[this.currentQuestionIndex];
    }

    checkAnswer(answerIndex: number): boolean {
        const q = this.getCurrentQuestion();
        if (!q) return false;
        return q.correctIndex === answerIndex;
    }

    nextQuestion() {
        this.currentQuestionIndex++;
    }

    isGameOver(): boolean {
        return this.currentQuestionIndex >= this.questions.length;
    }
}
