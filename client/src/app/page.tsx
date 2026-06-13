import Image from "next/image";
import Link from "next/link";
import { Gamepad2, Trophy, Users, Coins, Bell, Settings, Circle, MessageSquare } from "lucide-react";

const GAMES = [
  { id: "truco", name: "Truco Argentino", active: true, color: "from-blue-500 to-indigo-600", icon: "🃏", players: "1.2k" },
  { id: "ajedrez", name: "Ajedrez", active: true, color: "from-gray-700 to-gray-900", icon: "♟️", players: "450" },
  { id: "tenis", name: "Tenis Arcade", active: false, color: "from-green-400 to-emerald-600", icon: "🎾", players: "-" },
  { id: "trivia", name: "Trivia Quiz", active: true, color: "from-purple-500 to-pink-600", icon: "🧠", players: "800" },
  { id: "autos", name: "Carreras 3D", active: false, color: "from-red-500 to-orange-600", icon: "🏎️", players: "-" },
  { id: "damas", name: "Damas", active: true, color: "from-amber-600 to-red-800", icon: "🔴", players: "120" },
  { id: "penales", name: "Penales", active: false, color: "from-sky-400 to-blue-600", icon: "⚽", players: "-" },
  { id: "pingpong", name: "Ping Pong", active: false, color: "from-cyan-500 to-teal-600", icon: "🏓", players: "-" },
  { id: "memoria", name: "Memoria", active: false, color: "from-fuchsia-500 to-purple-600", icon: "🧩", players: "-" },
];

const FRIENDS = [
  { name: "Matias99", status: "online", game: "Hub", avatar: "Matias" },
  { name: "LaBestia_AR", status: "playing", game: "Truco", avatar: "Bestia" },
  { name: "GamerGirl", status: "offline", game: "", avatar: "Girl" },
  { name: "Paco_M", status: "online", game: "Hub", avatar: "Paco" },
];

export default function ArcadeWorldHub() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500/30 flex flex-col">
      {/* Navbar Superior */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-8 h-8 text-indigo-500" />
              <span className="font-black text-2xl tracking-tighter bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                ARCADE WORLD
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4">
                <button className="text-slate-400 hover:text-white transition"><Trophy className="w-5 h-5" /></button>
                <button className="text-slate-400 hover:text-white transition"><Users className="w-5 h-5" /></button>
                <button className="text-slate-400 hover:text-white transition relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                </button>
              </div>

              <div className="flex items-center gap-3 bg-slate-800 py-1.5 px-4 rounded-full border border-slate-700">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-yellow-400">1,250</span>
              </div>

              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-indigo-400 cursor-pointer overflow-hidden">
                <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" width={40} height={40} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        
        {/* Contenido Principal */}
        <main className="flex-1 py-8 pr-8 border-r border-slate-800">
          
          {/* Banner Destacado */}
          <div className="relative w-full h-64 rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-indigo-500/20 group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-blue-900"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
            <div className="relative h-full flex flex-col justify-center px-10">
              <span className="inline-block px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full uppercase tracking-wider mb-4 w-max shadow-lg">Juego Destacado</span>
              <h1 className="text-5xl font-black mb-2 text-white drop-shadow-lg">Truco Argentino Online</h1>
              <p className="text-indigo-200 max-w-lg text-lg mb-6">Demuestra que eres el mejor cantando retruco. Apuesta tus monedas y sube en el ranking nacional.</p>
              <Link href="/truco" className="bg-white text-indigo-900 px-8 py-3 rounded-xl font-bold text-lg w-max hover:bg-indigo-50 transition transform hover:scale-105 active:scale-95 shadow-xl shadow-white/10">
                Jugar Ahora
              </Link>
            </div>
          </div>

          {/* Lista de Juegos */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Todos los Juegos</h2>
            <div className="text-sm font-medium text-slate-400 flex gap-4">
              <span className="text-white">Populares</span>
              <span className="hover:text-white cursor-pointer">Nuevos</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES.map((game) => (
              <div 
                key={game.id} 
                className={`relative overflow-hidden rounded-2xl p-6 transition duration-300 ${
                  game.active 
                  ? 'bg-slate-800 hover:bg-slate-700 cursor-pointer border border-slate-700 hover:border-slate-500 transform hover:-translate-y-1 shadow-lg' 
                  : 'bg-slate-800/50 opacity-75 grayscale-[0.5] cursor-not-allowed border border-slate-800'
                }`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${game.color} opacity-20 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2`}></div>
                
                <div className="text-4xl mb-4">{game.icon}</div>
                <h3 className="text-xl font-bold mb-1">{game.name}</h3>
                
                {game.active ? (
                  <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    {game.players} jugando
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider">
                    Próximamente
                  </div>
                )}
                
                {/* Botón Jugar Ajedrez, Truco o Damas */}
                {game.id === 'ajedrez' && (
                  <Link href="/ajedrez" className="absolute inset-0 z-10"></Link>
                )}
                {game.id === 'truco' && (
                  <Link href="/truco" className="absolute inset-0 z-10"></Link>
                )}
                {game.id === 'damas' && (
                  <Link href="/damas" className="absolute inset-0 z-10"></Link>
                )}
                {game.id === 'trivia' && (
                  <Link href="/trivia" className="absolute inset-0 z-10"></Link>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* Panel Lateral: Amigos */}
        <aside className="w-80 py-8 pl-8 hidden lg:block">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Lista de Amigos
            </h2>
            <button className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg font-bold transition">
              + Añadir
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {FRIENDS.map((friend, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-700 group">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.avatar}`} alt={friend.name} width={40} height={40} className="rounded-full bg-slate-700" />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                      friend.status === 'online' ? 'bg-green-500' :
                      friend.status === 'playing' ? 'bg-indigo-500' : 'bg-slate-500'
                    }`}></span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{friend.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      {friend.status === 'playing' ? (
                        <><Gamepad2 className="w-3 h-3 text-indigo-400"/> Jugando {friend.game}</>
                      ) : friend.status === 'online' ? (
                        'En el Hub'
                      ) : (
                        'Desconectado'
                      )}
                    </div>
                  </div>
                </div>
                <button className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-indigo-900/30 border border-indigo-500/20 rounded-xl text-center">
            <div className="text-indigo-400 font-bold mb-2">Desafía a un amigo</div>
            <p className="text-xs text-slate-400 mb-4">Crea una sala privada y envíale tu código.</p>
            <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition">
              Crear Sala Privada
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}

