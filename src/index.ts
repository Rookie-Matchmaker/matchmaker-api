import express from 'express';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import SearchQueue from './libs/SearchQueue';
import Ticket from './libs/Ticket';
import { Player } from './libs/Lobby';

const port = process.env.PORT ?? 3000;
const app = express();
const queue = new SearchQueue();
const httpServer = createServer(app);
const playerMap = new Map<string, Player>();
const io = new Server(httpServer, {
  cors: {
    origin: [
      'https://hoppscotch.io',
      'http://localhost:3000',
      'https://amritb.github.io',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
// [...Array(8).keys()]
//   .map((val) => val.toString())
//   .forEach((key) => {
//     queue.enqueue(key);
//     const player: Player = {
//       id: key,
//       ready: true,
//       steamID: 'RANDOM STEAM KEY HERE',
//     };
//     playerMap.set(key, player);
//   });
// Read JSON body from the request
app.use(express.json());
// Create Tickets
app.route('/ticket').post((req, res) => {
  const { playerID, steamID } = req.body;
  const ticketID = queue.enqueue(playerID);
  const player: Player = {
    id: playerID,
    ready: true,
    steamID,
  };
  playerMap.set(playerID, player);
  const response = {
    tickedID: ticketID,
  };
  res.send(response);
});
io.on('connection', (socket: Socket) => {
  socket.on('waitForLobby', (ticketID: string) => {
    socket.join(ticketID);
  });
});
// Constant function to check for Match Created
setInterval(() => {
  // Match Conditions Met
  const [lobby, tickets] = queue.createLobby(playerMap);
  if (lobby) {
    console.log('GAME FOUND');
    tickets.forEach((ticket: Ticket) => {
      io.to(ticket.ticketID).emit('Game Found', lobby.lobbyID);
    });
    lobby.invitePlayers().catch((err) => console.log(err));
  } else {
    console.log('Finding GAME');
  }
}, 5000);

httpServer.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
