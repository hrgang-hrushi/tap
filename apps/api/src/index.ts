import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import routes from './routes';
import { initDb } from './db';

const app = express();
app.use(cors());
app.use(express.json());

// Init DB
initDb();

// Configure Routes
app.use('/api', routes);


const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('Device connected:', socket.id);
  
  socket.on('knock_event', (data) => {
    console.log('Knock event received from client:', data);
    io.emit('knock_event', data);
  });

  socket.on('trigger_permissions_request', () => {
    console.log('Broadcasting permissions request to all clients');
    io.emit('request-permissions-from-electron');
  });

  socket.on('permissions_status', (data) => {
    console.log('Permission status received:', data);
    io.emit('permissions_status', data);
  });

  socket.on('disconnect', () => {
    console.log('Device disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Knock Clone API listening on port ${PORT}`);
});
