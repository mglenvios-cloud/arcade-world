"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Trophy } from "lucide-react";
import * as Colyseus from "colyseus.js";

export default function TriviaPage() {
    const [room, setRoom] = useState<Colyseus.Room | null>(null);
    const [status, setStatus] = useState("Conectando...");
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState(10);
    const [players, setPlayers] = useState<any[]>([]);
    const [myScore, setMyScore] = useState(0);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [gameStatus, setGameStatus] = useState("waiting");

    useEffect(() => {
        let clientRoom: Colyseus.Room;

        const connect = async () => {
            try {
                const client = new Colyseus.Client(
                    window.location.hostname === "localhost" 
                    ? "ws://localhost:2567" 
                    : "wss://tender-rooms-jam.loca.lt"
                );
                
                clientRoom = await client.joinOrCreate("trivia", { name: "TriviaPlayer" });
                setRoom(clientRoom);
                setStatus("Conectado. Esperando jugadores...");

                clientRoom.onStateChange((state: any) => {
                    setGameStatus(state.status);
                    setQuestion(state.questionText);
                    
                    // Colyseus ArraySchema a Array normal
                    const opts: string[] = [];
                    state.options.forEach((opt: string) => opts.push(opt));
                    setOptions(opts);
                    
                    setTimeLeft(state.timeLeft);

                    const pList: any[] = [];
                    state.players.forEach((p: any, sessionId: string) => {
                        pList.push(p);
                        if (sessionId === clientRoom.sessionId) {
                            setMyScore(p.score);
                            setHasAnswered(p.hasAnswered);
                        }
                    });
                    
                    // Ordenar por score
                    pList.sort((a,b) => b.score - a.score);
                    setPlayers(pList);
                });
            } catch (e) {
                console.error(e);
                setStatus("Error de conexión");
            }
        };

        connect();

        return () => {
            if (clientRoom) clientRoom.leave();
        };
    }, []);

    const sendAnswer = (index: number) => {
        if (room && !hasAnswered) {
            room.send("answer", { answerIndex: index });
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
            <nav className="p-4 flex items-center justify-between bg-slate-800 border-b border-slate-700">
                <Link href="/" className="flex items-center gap-2 text-pink-400 hover:text-pink-300 font-bold transition">
                    <ArrowLeft className="w-5 h-5" />
                    Volver al Hub
                </Link>
                <div className="font-black text-2xl tracking-tighter bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    TRIVIA QUIZ
                </div>
                <div className="flex items-center gap-2 text-yellow-400 font-bold bg-slate-900 px-4 py-1.5 rounded-full border border-slate-700">
                    <Trophy className="w-4 h-4" />
                    {myScore} pts
                </div>
            </nav>

            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-8">
                
                {/* Zona Principal (Pregunta) */}
                <div className="flex-1 flex flex-col justify-center">
                    {gameStatus === "waiting" && (
                        <div className="text-center bg-slate-800/50 border border-slate-700 p-12 rounded-3xl shadow-xl">
                            <div className="text-6xl mb-6 animate-bounce">⏳</div>
                            <h2 className="text-2xl font-bold mb-2">{status}</h2>
                            <p className="text-slate-400">El juego comenzará automáticamente cuando haya al menos 2 jugadores.</p>
                        </div>
                    )}

                    {gameStatus === "playing" && (
                        <div className="bg-slate-800 border border-slate-700 p-8 sm:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-slate-700">
                                <div 
                                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000 ease-linear"
                                    style={{ width: `${(timeLeft / 10) * 100}%` }}
                                ></div>
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="text-pink-400 font-bold text-sm tracking-wider uppercase">Pregunta Actual</div>
                                <div className={`flex items-center gap-2 font-mono text-2xl font-bold ${timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                    <Clock className="w-6 h-6" />
                                    00:{timeLeft.toString().padStart(2, '0')}
                                </div>
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-black mb-10 leading-tight">
                                {question}
                            </h1>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {options.map((opt, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => sendAnswer(i)}
                                        disabled={hasAnswered}
                                        className={`p-4 rounded-xl text-lg font-bold text-left transition transform hover:scale-[1.02] active:scale-[0.98] ${
                                            hasAnswered 
                                            ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-600' 
                                            : 'bg-slate-700 hover:bg-indigo-600 text-white border border-slate-600 hover:border-indigo-400 shadow-lg'
                                        }`}
                                    >
                                        <span className="inline-block w-8 text-slate-400 font-mono">{String.fromCharCode(65 + i)}.</span>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {gameStatus === "finished" && (
                        <div className="text-center bg-gradient-to-br from-indigo-900 to-purple-900 border border-purple-500/30 p-12 rounded-3xl shadow-2xl">
                            <div className="text-6xl mb-6">🏆</div>
                            <h1 className="text-4xl font-black mb-2 text-white">¡Partida Terminada!</h1>
                            <p className="text-purple-200 text-xl mb-8">Revisa la tabla de posiciones a la derecha.</p>
                            <button onClick={() => window.location.reload()} className="bg-white text-purple-900 px-8 py-3 rounded-full font-bold hover:bg-purple-50 transition shadow-lg">
                                Jugar Otra Vez
                            </button>
                        </div>
                    )}
                </div>

                {/* Panel Lateral (Ranking en vivo) */}
                <div className="w-full lg:w-80 bg-slate-800/80 border border-slate-700 rounded-3xl p-6 h-fit">
                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-indigo-400" />
                        Clasificación
                    </h3>
                    <div className="flex flex-col gap-3">
                        {players.map((p, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{p.name}</div>
                                        <div className="text-xs text-slate-400">{p.hasAnswered ? 'Respondió' : 'Pensando...'}</div>
                                    </div>
                                </div>
                                <div className="font-black text-yellow-400">{p.score}</div>
                            </div>
                        ))}
                        {players.length === 0 && (
                            <div className="text-sm text-slate-500 text-center py-4">Nadie ha entrado aún</div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}

function UsersIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
