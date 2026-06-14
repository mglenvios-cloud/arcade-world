"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PenalesPage() {
    const gameContainer = useRef<HTMLDivElement>(null);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        let game: Phaser.Game;

        const initPhaser = async () => {
            if (!gameContainer.current) return;
            
            const Phaser = await import("phaser");
            const { PenalScene } = await import("../../game/scenes/PenalScene");

            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                width: 800,
                height: 600,
                parent: gameContainer.current,
                backgroundColor: "#2e7d32", // Verde césped
                scene: [PenalScene],
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
        <div className="min-h-screen bg-slate-900 flex flex-col">
            <nav className="p-4 flex items-center justify-between bg-slate-800 border-b border-slate-700">
                <Link href="/" className="flex items-center gap-2 text-sky-400 hover:text-sky-300 font-bold transition">
                    <ArrowLeft className="w-5 h-5" />
                    Volver al Hub
                </Link>
                <div className="text-white font-bold text-xl uppercase">Tanda de Penales</div>
                <div className="w-24"></div>
            </nav>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700">
                    {!gameStarted && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-white font-bold text-xl z-10">
                            Cargando Estadio...
                        </div>
                    )}
                    <div ref={gameContainer} className="w-full max-w-4xl aspect-[4/3] bg-slate-800" />
                </div>
            </main>
        </div>
    );
}
