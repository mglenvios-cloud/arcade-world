// @ts-nocheck
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { GlobalChatRoom } from "./rooms/GlobalChatRoom";
import { TrucoRoom } from "./rooms/TrucoRoom";
import { LobbyRoom } from "./rooms/LobbyRoom";
import { ChessRoom } from "./rooms/ChessRoom";
import { CheckersRoom } from "./rooms/CheckersRoom";
import { TriviaRoom } from "./rooms/TriviaRoom";
import { PingPongRoom } from "./rooms/PingPongRoom";
import { MemoryRoom } from "./rooms/MemoryRoom";
import { PenalRoom } from "./rooms/PenalRoom";
import { RacingRoom } from "./rooms/RacingRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({
    server
  })
});

// Register Rooms
gameServer.define('lobby', LobbyRoom);
gameServer.define('global_chat', GlobalChatRoom);
gameServer.define('truco', TrucoRoom);
gameServer.define('chess', ChessRoom);
gameServer.define('checkers', CheckersRoom);
gameServer.define('trivia', TriviaRoom);
gameServer.define('pingpong', PingPongRoom);
gameServer.define('memory', MemoryRoom);
gameServer.define('penales', PenalRoom);
gameServer.define('racing', RacingRoom);

// Listen
gameServer.listen(port).then(() => {
  console.log(`[Colyseus] Arcade World Server is listening on http://localhost:${port}`);
});
