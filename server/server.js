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

                        // find players id on the server
                        let playerIdx = -1;
                        try {
                            for ( let [idx,player] of gm.players) {
                                if (player.player_id === socket.id) {
                                    playerIdx = idx;
                                    break;
                                }
                            }
                            if (playerIdx === -1) {
                                throw new Error('Player Index could not found!');
                            }
                        } catch (e) {
                            console.error(e.msg, ` Socket id: ${socket.id}`);
                            return;
                        }
                        // check if its his turn and didnot already drew 
                        try {
                            gm.whose_turn === playerIdx ? null :  new Error('Not your turn');
                            gm.didDrawCard[playerIdx] ? new Error('Already drew a card') : null;
                        } catch (e) {
                            console.error(e.msg);
                            return;
                        }


                        // check wheter card is matching as expected
                        const cards = gm.players.get(playerIdx).cards; 
                        const copyOfUserHand = [...handFromClient.cardSlots].filter(card => card !== 0);
                        if (copyOfUserHand.length === 22) {
                            cards.push(
                                gm.discard_piles[(handFromClient.playerIdx+3) % 4][gm.discard_piles[(handFromClient.playerIdx+3) % 4].length-1] 
                            );
                        }
                        cards.sort((a,b) => b-a);
                        copyOfUserHand.sort((a,b) => b-a);

                        try {
                            if (cards.length !== copyOfUserHand.length) {
                                throw new Error('Cards length mismatch');
                            } else {
                                for (let i = 0; i < cards.length; i++) {
                                    if (cards[i] !== copyOfUserHand[i]) {
                                        throw new Error('Cards mismatch with ids of ', cards[i], copyOfUserHand[i]);
                                    }
                                }
                            }
                        } catch (e) {
                            console.log(e , ` Socket id: ${socket.id} - Reverting process...`);
                            const revertedHand = gm.players.get(playerIdx).cards;
                            while (revertedHand.length < 30) {
                                revertedHand.push(0);
                            }
                            socket.emit('draw-card-left-error',revertedHand ,gm.discard_piles[(handFromClient.playerIdx+3) % 4]);
                            return;
                        }

                        const player = gm.players.get(playerIdx);
                        gm.players.set(playerIdx, {
                            ...player,
                            cards: handFromClient.cardSlots
                        })
                        gm.discard_piles[(handFromClient.playerIdx+3) % 4].pop()
                        gm.didDrawCard[playerIdx] = true;
                        gameSocket.emit('draw-card-left-from-server',gm.discard_piles,playerIdx); 
                        console.log(`Server-side: Draw Left completed!`);

                    })

                    socket.on('draw-card-mid-request', (hand,targetSlotIdx) => {

                        let playerIdx = -1;
                        try {
                            for ( let [idx,player] of gm.players) {
                                if (player.player_id === socket.id) {
                                    playerIdx = idx;
                                    break;
                                }
                            }
                            if (playerIdx === -1) {
                                throw new Error('Player Index could not found!');
                            }
                            if (hand.playerIdx != playerIdx) {
                                throw new Error(`Player Id mismatch! Expected ${playerIdx} but got ${hand.playerIdx}`);
                            }
                            
                        } catch (e) {
                            console.error(e.msg, ` Socket id: ${socket.id}`);
                            return;
                        }

                        // check if its his turn and didnot already drew 
                        try {
                            gm.whose_turn === playerIdx ? null :  new Error('Not your turn');
                            gm.didDrawCard[playerIdx] ? new Error('Already drew a card') : null;
                        } catch (e) {
                            console.error(e.msg);
                            return;
                        }

                        gm.drawCardMid( hand, targetSlotIdx );
                        socket.emit('draw-card-mid-response', gm.players.get(hand.playerIdx).cards);
                        console.log(`Server-side: Draw Mid completed!`);

                    }) 

                    
                    socket.on('next-turn-from-client', ( handFromClient,discardedCardId ) => {
                        // check if it's turn
                        // find players id on the server
                        let playerIdx = -1;
                        console.log(`alp`);
                        try {
                            for ( let [idx,player] of gm.players) {
                                if (player.player_id === socket.id) {
                                    playerIdx = idx;
                                    break;
                                }
                            }
                            if (playerIdx === -1) {
                                throw new Error('Player Index could not found!');
                            }
                        } catch (e) {
                            console.log(e, ` Socket id: ${socket.id}`);
                            return;
                        }
                        console.log('next turn here ! ',playerIdx)
                        
                        try {
                            gm.whose_turn === playerIdx ? null :  new Error('Not your turn');
                            gm.didDrawCard[playerIdx] ? null : new Error(`Hasn't drawn a card yet!`);
                        } catch (e) {
                            console.error(e.msg);
                            return;
                        }
                        console.log('next turn whose_turn control ! ',gm.whose_turn === playerIdx)

                        // check wheter card is matching as expected
                        try {
                            const indexOfDiscardedCard = gm.players.get(playerIdx).cards.indexOf(discardedCardId);
                            if (indexOfDiscardedCard === -1) {
                                throw new Error('Card not found in hand / discarded card mismatch! Reverting process...');
                            }
                        } catch (e) {
                            console.log(e.msg);
                            socket.emit('next-turn-error', gm.players.get(playerIdx).cards, gm.discard_piles[playerIdx]);
                            return;
                        }
                        console.log(` ~before gm.nextturn`);
                        
                        
                        gm.nextTurn();
                        gm.discard_piles[handFromClient.playerIdx].push(discardedCardId);
                        gm.players.set(handFromClient.playerIdx, {
                            ...gm.players.get(handFromClient.playerIdx),
                            cards: handFromClient.cardSlots
                        });
                        gameSocket.emit('next-turn-from-server',gm.whose_turn,gm.discard_piles);
                        console.log(`Server-side: next-turn completed!`);
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
                    .emit('await-transaction')
                
                    
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