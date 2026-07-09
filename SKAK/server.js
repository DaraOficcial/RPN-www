const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Sajikan file statis frontend dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

let waitingPlayer = null; // Menampung player yang antre

io.on('connection', (socket) => {
    console.log(`User tersambung: ${socket.id}`);

    // LOGIKA MATCHMAKING OTOMATIS
    if (!waitingPlayer) {
        // Player pertama masuk antrean
        waitingPlayer = socket;
        socket.emit('status_waiting', 'Menunggu lawan bergabung...');
    } else {
        // Player kedua masuk, pasangkan mereka!
        const roomName = `room_${waitingPlayer.id}_${socket.id}`;
        const p1 = waitingPlayer;
        const p2 = socket;

        p1.join(roomName);
        p2.join(roomName);

        p1.room = roomName; p1.role = 1; // Player 1 = Putih
        p2.room = roomName; p2.role = 2; // Player 2 = Cokelat

        // Beritahu kedua player bahwa game dimulai
        p1.emit('game_start', { role: 1, opponent: p2.id });
        p2.emit('game_start', { role: 2, opponent: p1.id });

        console.log(`Match ditemukan! Room: ${roomName}`);
        waitingPlayer = null; // Kosongkan slot antrean
    }

    // TERIMA GERAKAN PION DARI CLIENT
    socket.on('move_piece', (data) => {
        if (socket.room) {
            // Siarkan gerakan ke lawan di room yang sama
            socket.to(socket.room).emit('opponent_move', data);
        }
    });

    // PENGONDISIAN JIKA PUTUS KONEKSI (RAGE QUIT)
    socket.on('disconnect', () => {
        console.log(`User terputus: ${socket.id}`);
        if (waitingPlayer && waitingPlayer.id === socket.id) {
            waitingPlayer = null;
        }
        if (socket.room) {
            io.to(socket.room).emit('opponent_left', 'Lawan kabur/terputus! Kamu menang WO.');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server SKAK Online aktif di port *:${PORT}`);
});
