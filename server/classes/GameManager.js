const Per = require('./Per.js');
class GameManager {

    // Private fields
    #socket; #game_id; #mid_pile;


    constructor(game_socket, room_id, players) {
        this.#socket = game_socket;
        this.#game_id = room_id;
        this.round = 1; // 4 rounds total
        this.whose_turn = 0; // 0 | 1 | 2 | 3 

        this.#mid_pile = [];
        this.discard_piles = [
            [], // 0 to 1 - discard pile
            [], // 1 to 2 - discard pile
            [], // 2 to 3 - discard pile
            [], // 3 to 0 - discard pile
        ];

        this.tables = [
            Array.from({length: 50}, () => 0),
            Array.from({length: 50}, () => 0),
            Array.from({length: 50}, () => 0),
            Array.from({length: 50}, () => 0)
        ]
        
        this.players = new Map();
        for (let i = 0; i < 4; i++) {
            this.players.set( i, {
                player_id: players[i],
                cards: Array.from({length:30}, () => 0),
                score: 0,
            });
        }
        this.opened_hands = Array.from({length: 4}, () => false);
        this.didDrawCard = Array.from({length:4}, () => true);
    }

    dealCards() {
        const cards = Array.from({length: 106}, (_, i) => i + 1);

        for (let [idx,player] of this.players) {
            // console.log(idx);
            const playerCards = cards.splice(0, idx === this.whose_turn ? 22 : 21);
            this.#socket.to(player.player_id).emit('dealing-cards', playerCards,idx);
            this.players.set(idx, {
                ...player,
                cards: playerCards,
            });
        }
        this.#mid_pile = cards.reverse();
        console.log(this.players.get(1).cards);
    }

    drawCardMid( hand,targetSlotIdx ) {
        const cardId = this.#mid_pile.pop();
        const newCards = hand.cardSlots;
        
        if (newCards[targetSlotIdx] === 200) {
            newCards[targetSlotIdx] = cardId;
        } else {
            for (let idx = 0; idx < newCards.length; idx++) {
                if (newCards[idx] === 200) {
                    newCards[idx] = cardId;
                    break;
                }
            }
        }
        const player = this.players.get(hand.playerIdx);
        this.players.set(hand.playerIdx, {
            ...player,
            cards: newCards
        })
        this.didDrawCard[hand.playerIdx] = true;
        return cardId;
    }



    tick() {
        this.intervals.push(setInterval(() =>{
            this.#socket.emit('game-tick', this.whose_turn);
        }, 100))
    }

    nextTurn(){
        this.whose_turn = (this.whose_turn + 1) % 4;
        this.didDrawCard[this.whose_turn] = false;
        this.#socket.emit('next-turn-from-server', this.whose_turn,this.discard_piles);
    }

}
module.exports = GameManager;