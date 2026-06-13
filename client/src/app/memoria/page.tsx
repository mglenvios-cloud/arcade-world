"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import * as Colyseus from "colyseus.js";

export default function MemoryPage() {
    const [room, setRoom] = useState<Colyseus.Room | null>(null);
    const [status, setStatus] = useState("Conectando...");
    const [cards, setCards] = useState<any[]>([]);
    const [players, setPlayers] = useState<any[]>([]);
    const [currentTurn, setCurrentTurn] = useState("");
    const [mySessionId, setMySessionId] = useState("");

    useEffect(() => {
        let clientRoom: Colyseus.Room;

        const connect = async () => {
            try {
                const client = new Colyseus.Client(
                    window.location.hostname === "localhost" 
                    ? "ws://localhost:2567" 
                    : "wss://tender-rooms-jam.loca.lt"
                );
                
                clientRoom = await client.joinOrCreate("memory", { name: "Jugador Memoria" });
                setRoom(clientRoom);
                setMySessionId(clientRoom.sessionId);
                setStatus("Esperando rival...");

                clientRoom.onStateChange((state: any) => {
                    if (state.status === "playing") setStatus("Partida en curso");
                    if (state.status === "finished") setStatus("¡Partida Terminada!");
                    
                    setCurrentTurn(state.currentTurn);

                    const newCards: any[] = [];
                    state.cards.forEach((c: any) => newCards.push(c));
                    setCards(newCards);

                    const pList: any[] = [];
                    state.players.forEach((p: any, sessionId: string) => {
                        pList.push({ id: sessionId, ...p });
                    });
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

    const flipCard = (index: number) => {
        if (room && currentTurn === mySessionId) {
            room.send("flip", { index });
        }
    };

    return (
        <div className="min-h-screen bg-fuchsia-950 text-white flex flex-col font-sans">
            <nav className="p-4 flex items-center justify-between bg-fuchsia-900 border-b border-fuchsia-800 shadow-xl">
                <Link href="/" className="flex items-center gap-2 text-fuchsia-300 hover:text-fuchsia-200 font-bold transition">
                    <ArrowLeft className="w-5 h-5" />
                    Volver al Hub
                </Link>
                <div className="font-black text-2xl tracking-widest text-fuchsia-100">
                    MEMORIA MÁGICA
                </div>
                <div className="w-24"></div>
            </nav>

            <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-8">
                
                {/* Zona del Tablero */}
                <div className="flex-1">
                    <div className="bg-fuchsia-900/50 p-6 rounded-3xl border border-fuchsia-700/50 shadow-2xl">
                        <div className="grid grid-cols-4 gap-3 sm:gap-4">
                            {cards.map((card, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => flipCard(idx)}
                                    className={`relative w-full aspect-square cursor-pointer perspective-1000 transition-transform duration-300 hover:scale-105 ${
                                        currentTurn !== mySessionId ? 'opacity-90 cursor-not-allowed' : ''
                                    }`}
                                >
                                    <div className={`w-full h-full transition-all duration-500 transform-style-3d ${
                                        (card.isFlipped || card.isMatched) ? 'rotate-y-180' : ''
                                    }`}>
                                        
                                        {/* Frente (oculto) */}
                                        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-fuchsia-600 to-purple-800 rounded-2xl border-2 border-fuchsia-400/30 flex items-center justify-center shadow-inner">
                                            <div className="text-4xl opacity-20">❓</div>
                                        </div>

                                        {/* Reverso (descubierto) */}
                                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-100 to-white rounded-2xl border-2 border-fuchsia-300 flex items-center justify-center shadow-lg">
                                            <div className={`text-5xl transition-all duration-500 ${card.isMatched ? 'scale-110 opacity-50' : 'scale-100'}`}>
                                                {card.value !== "?" ? card.value : ""}
                                            </div>
                                            {card.isMatched && (
                                                <div className="absolute inset-0 bg-green-500/20 rounded-xl"></div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Panel Lateral (Estado y Jugadores) */}
                <div className="w-full lg:w-80 flex flex-col gap-6">
                    <div className="bg-fuchsia-900/80 border border-fuchsia-700 rounded-3xl p-6 shadow-xl text-center">
                        <h3 className="font-bold text-fuchsia-300 uppercase tracking-widest text-sm mb-2">Estado del Juego</h3>
                        <div className="text-2xl font-black text-white">{status}</div>
                    </div>

                    <div className="bg-fuchsia-900/80 border border-fuchsia-700 rounded-3xl p-6 shadow-xl flex-1">
                        <h3 className="font-bold text-fuchsia-300 uppercase tracking-widest text-sm mb-4">Jugadores</h3>
                        <div className="flex flex-col gap-4">
                            {players.map((p, idx) => {
                                const isMe = p.id === mySessionId;
                                const isMyTurn = p.id === currentTurn;
                                return (
                                    <div key={idx} className={`p-4 rounded-2xl border-2 transition-all ${
                                        isMyTurn 
                                        ? 'bg-fuchsia-800 border-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.5)] scale-105' 
                                        : 'bg-fuchsia-950/50 border-fuchsia-800'
                                    }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 font-bold">
                                                <User className={`w-5 h-5 ${isMyTurn ? 'text-fuchsia-300' : 'text-fuchsia-700'}`} />
                                                {p.name} {isMe && "(Tú)"}
                                            </div>
                                            <div className="text-2xl font-black text-fuchsia-200">{p.score}</div>
                                        </div>
                                        <div className="text-xs uppercase tracking-wider font-bold text-fuchsia-400/70">
                                            {isMyTurn ? 'Pensando...' : 'Esperando...'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
