"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PingPongPage() {
    const gameContainer = useRef<HTMLDivElement>(null);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        let game: Phaser.Game;

        const initPhaser = async () => {
            if (!gameContainer.current) return;
            
            const Phaser = await import("phaser");
            const { PingPongScene } = await import("../../game/scenes/PingPongScene");

            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                width: 800,
                height: 800,
                parent: gameContainer.current,
                backgroundColor: "#000000",
                scene: [PingPongScene],
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                }
            };

            game = new Phaser.Game(config);
            setGameStarted(true);
        };

        initPhaser();

        return () => {
            if (game) {
                game.destroy(true);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <nav className="p-4 flex items-center justify-between bg-zinc-900 border-b border-zinc-800">
                <Link href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold transition">
                    <ArrowLeft className="w-5 h-5" />
                    Volver al Hub
                </Link>
                <div className="text-white font-bold text-xl uppercase tracking-widest font-mono">Ping Pong</div>
                <div className="w-24"></div>
            </nav>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="relative rounded-lg overflow-hidden shadow-2xl border border-zinc-800 shadow-cyan-500/20">
                    {!gameStarted && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black text-white font-bold text-xl z-10 font-mono">
                            Cargando Físicas...
                        </div>
                    )}
                    <div ref={gameContainer} className="w-full max-w-4xl aspect-square bg-black" />
                </div>
            </main>
        </div>
    );
}
