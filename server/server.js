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
                            console.log(e, ` Socket id: ${socket.id}`);
                            return;
                        }
                        // check if its his turn and didnot already drew 
                        try {
                            gm.whose_turn === playerIdx ? null :  new Error('Not your turn');
                            gm.didDrawCard[playerIdx] ? new Error('Already drew a card') : null;
                        } catch (e) {
                            console.log(e);
                            return;
                        }

                        // // check wheter card is matching as expected
                        // const cards = gm.players.get(playerIdx).cards; 
                        // let copyOfUserHand = [...handFromClient.cardSlots].filter(card => card !== 0);
                        // if (copyOfUserHand.length === 22) {
                        //     cards.push(
                        //         gm.discard_piles[(handFromClient.playerIdx+3) % 4][gm.discard_piles[(handFromClient.playerIdx+3) % 4].length-1] 
                        //     );
                        // }
                        // cards.sort((a,b) => b-a);
                        // copyOfUserHand.sort((a,b) => b-a);

                        // try {
                        //     for (let i = 0; i < copyOfUserHand.length; i++) {
                        //         if (cards[i] !== copyOfUserHand[i]) {
                        //             throw new Error('Cards mismatch with ids of ', cards[i], copyOfUserHand[i]);
                        //         }
                        //     }
                        // } catch (e) {
                        //     console.log(e , ` Socket id: ${socket.id} - Reverting process...`);
                        //     const revertedHand = handFromClient.cardSlots;
                        //     while (revertedHand.length < 30) {
                        //         revertedHand.push(0);
                        //     }
                        //     socket.emit('draw-card-left-error',revertedHand ,gm.discard_piles[(handFromClient.playerIdx+3) % 4]);
                        //     return;
                        // }

                        const player = gm.players.get(playerIdx);
                        gm.players.set(playerIdx, {
                            ...player,
                            cards: handFromClient.cardSlots
                        })
                        gm.discard_piles[(handFromClient.playerIdx+3) % 4].pop()
                        gm.didDrawCard[playerIdx] = true;
                        gameSocket.emit('draw-card-left-from-server',gm.discard_piles,playerIdx); 
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
                            console.log(e, ` Socket id: ${socket.id}`);
                            return;
                        }

                        // check if its his turn and didnot already drew 
                        try {
                            gm.whose_turn === playerIdx ? null :  new Error('Not your turn');
                            gm.didDrawCard[playerIdx] ? new Error('Already drew a card') : null;
                        } catch (e) {
                            console.log(e);
                            return;
                        }

                        const midCount = gm.drawCardMid( hand, targetSlotIdx );
                        socket.emit('draw-card-mid-response', gm.players.get(playerIdx).cards);
                        gameSocket.emit('draw-card-mid-response-to-all', midCount);
                    }) 

                    socket.on('open-hand-request-from-client', (perResults,cardSlots) => {
                        // check if it's turn
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
                            if (perResults.points < 101) {
                                throw new Error('You cannot open your hand with these pers!');
                            }
                            let totalLen=0;
                            for (let per of perResults.pers) {
                                totalLen += per.perCardIds.length;
                            }
                            if (totalLen > 21) {
                                throw new Error('You have to leave at least 1 card in your hand!');
                            }
                            if (gm.didDrawCard[playerIdx] === false) {
                                throw new Error('You have to draw a card first!');
                            }

                        } catch (e) {
                            socket.emit('err',e);
                            return;
                        }
                        
                        // @TODO:
                        // Check if he has the cards
                        
                        
                        
                        for (let per of perResults.pers) {
                            for (let card of per.perCardIds){
                                const cardSlotIdx = cardSlots.indexOf(card); 
                                if (cardSlotIdx === -1) {
                                    console.log('Card not found in hand!');
                                    return;
                                } else {
                                    cardSlots[cardSlotIdx] = 0;
                                }
                            }
                        }

                        gm.opened_hands[playerIdx] = true;
                        // table update
                        let row = 0;
                        let temp_for_6th_7th_pers = [];
                        if (perResults.pers.length > 5) {
                            for (let i=0; i<perResults.pers.length; i++) {
                                if(perResults.pers[i].perCardIds.length === 3) {
                                    temp_for_6th_7th_pers.push(i);
                                }
                            }
                        }
                        for (let per of perResults.pers) {
                            if (row >= 5) {
                                const rowIdx = temp_for_6th_7th_pers[row-5]
                                gm.tables[playerIdx][(12*rowIdx)+ 1] = gm.tables[playerIdx][(12*rowIdx)+ 5];
                                gm.tables[playerIdx][(12*rowIdx)+ 2] = gm.tables[playerIdx][(12*rowIdx)+ 6];
                                gm.tables[playerIdx][(12*rowIdx)+ 3] = gm.tables[playerIdx][(12*rowIdx)+ 7];
                                
                                gm.tables[playerIdx][(12*rowIdx)+ 5] = 0;
                                gm.tables[playerIdx][(12*rowIdx)+ 6] = 0;
                                gm.tables[playerIdx][(12*rowIdx)+ 7] = 0;
                                
                                const startIdx = 6;
                                for (let i=0; i<per.perCardIds.length; i++) {
                                    gm.tables[playerIdx][(12*rowIdx)+ startIdx + i] = per.perCardIds[i];
                                }
                            } else {
                                const startIdx = 6 - Math.floor(per.perCardIds.length / 2);
                                for (let i=0; i<per.perCardIds.length; i++) {
                                    gm.tables[playerIdx][(12*row)+ startIdx + i] = per.perCardIds[i];
                                }
                            }
                            row++;
                        }
                        
                        gm.players.set(playerIdx, {
                            ...gm.players.get(playerIdx),
                            cards: cardSlots
                        });
                        gameSocket.emit('open-hand-response-to-all', gm.tables);
                        socket.emit('open-hand-response-to-client', cardSlots);
                    })

                    
                    socket.on('next-turn-from-client', ( handFromClient,discardedCardId ) => {
                        // check if it's turn
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
                            console.log(e, ` Socket id: ${socket.id}`);
                            return;
                        }   
                        
                        try {
                            gm.whose_turn === playerIdx ? null :  new Error('Not your turn');
                            gm.didDrawCard[playerIdx] ? null : new Error(`Hasn't drawn a card yet!`);
                        } catch (e) {
                            console.log(e);
                            return;
                        }
                        // check wheter card is matching as expected
                        try {
                            const indexOfDiscardedCard = gm.players.get(playerIdx).cards.indexOf(discardedCardId);
                            if (indexOfDiscardedCard === -1) {
                                throw new Error('Card not found in hand / discarded card mismatch! Reverting process...');
                            }
                        } catch (e) {
                            console.log(e);
                            socket.emit('next-turn-error',e, gm.players.get(playerIdx).cards, gm.discard_piles[playerIdx]);
                            return;
                        }


                        gm.nextTurn();
                        gm.discard_piles[handFromClient.playerIdx].push(discardedCardId);
                        gm.players.set(handFromClient.playerIdx, {
                            ...gm.players.get(handFromClient.playerIdx),
                            cards: handFromClient.cardSlots
                        });
                        gameSocket.emit('next-turn-from-server',gm.whose_turn,gm.discard_piles);
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