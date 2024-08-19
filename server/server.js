const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);

const cors = require('cors');
app.use(cors());

const io = new Server (server, {
    cors: {
        origin: 'http://localhost:3000',
    },
    connectionStateRecovery: true,
})

// Game Management
const GameManager = require('./classes/GameManager');

let waitingPlayers = [];
let rooms = [];
let sockets = [];
let gameManagers = new Map();

function createGameSocket(gameRoomId) {
    const gameSocket = io.of(`/game/${gameRoomId}`);
    const players = new Array();
    gameSocket.on('connection', async (socket) => {
        // game logic here
        console.log(`a user connected to the game (id:${gameRoomId}) with socket id:${socket.id} `);
        
        if (players.length === 4) {
            socket.emit('err-game-full');
        } else {
            players.push(socket.id);
            socket.join(gameRoomId);
            if (players.length === 4) {
                //  
                // game logic goes here
                // 
                
                const gm = new GameManager(gameSocket, gameRoomId, players);
                gameManagers = gameManagers.set(gameRoomId, gm);
                gm.dealCards();
                const sockets = await gameSocket.fetchSockets();
                sockets.map(socket => {
                    socket.on('msg', msg => {
                        console.log(msg);
                    })
                    
                    socket.on('draw-card-left-from-client', (handFromClient)=>{
                        const player = gm.players.get(handFromClient.playerIdx);
                        gm.players.set(handFromClient.playerIdx, {
                            ...player,
                            cards: handFromClient.cardSlots
                        })
                        gm.discard_piles[(handFromClient.playerIdx+3) % 4].pop()
                        gameSocket.emit('draw-card-left-from-server',gm.discard_piles);                        
                    })
                    
                    socket.on('next-turn-from-client', ({playerIdx, hand, cardId}) => {
                        gm.nextTurn();
                        gm.discard_piles[playerIdx].push(cardId);
                        gm.players.set(playerIdx, {
                            ...gm.players.get(playerIdx),
                            hand
                        });
                        gameSocket.emit('next-turn-from-server',gm.whose_turn,gm.discard_piles);
                    })

                    socket.on('draw-card-mid-request', (hand) => {
                        gm.drawCardMid( hand );
                        socket.emit('draw-card-mid-response', gm.players.get(hand.playerIdx).cards);
                    }) 


                })

                // setting up event listeners
                gameSocket.emit('game-status-start');
            }
        }
        socket.on('disconnect', () => {
            // for (let [playerId,_] of gameSocket.players) {
            //     if (socket.id === playerId) {
            //         gameSocket.players.delete(playerId);
            //         break;
            //     }
            // }
            socket.leave(gameRoomId);
            if (players.length === 0) {
                gameSocket.emit('game-over');
            }
        })
    })
    sockets.push(gameSocket);
    // setTimeout(() => {
    //     gameSocket.emit('game-over');
    // }, 10000);
} 
io.of('/waiting-room').on('connection', socket => {
    console.log('a user connected with id: ', socket.id);

    waitingPlayers.push(socket.id);

    let playerCountInterval;
    let gameStartInterval;
    if (waitingPlayers.length === 1 ){
        playerCountInterval = setInterval(() => {
            io.of('/waiting-room').emit('player-counter', waitingPlayers.length);

        },1000);

        gameStartInterval = setInterval(() => {
            if ( waitingPlayers.length >= 4) {
                // game start!!
                const gameRoomId = Math.floor(Math.random() * 1000);
                const playersToSent = waitingPlayers.splice(0,4);
                io.of('/waiting-room')  
                    .to(playersToSent[0])
                    .to(playersToSent[1])
                    .to(playersToSent[2])
                    .to(playersToSent[3])
                    .emit('game-start', gameRoomId);
                rooms.push(gameRoomId);
                createGameSocket(gameRoomId);
            }
        }, 2500)
        
    }
    
    socket.on('disconnect', () => {
        console.log('user disconnected with id: ', socket.id);
        waitingPlayers = waitingPlayers.filter(player => player !== socket.id);
        if (waitingPlayers.length === 0){
            clearInterval(playerCountInterval);
            clearInterval(gameStartInterval);
        }
    });
})

server.listen(4000,()=>{console.log(`Server is running on port 4000`)});