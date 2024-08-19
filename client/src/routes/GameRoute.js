import { useEffect,useState,createContext } from "react";
import { useParams,useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { io } from 'socket.io-client';

import Board from '../components/Board';
import PlayerLabels from '../components/PlayerLabels'
import InitialHand from "../constants/InitialHand";

export const HandContext = createContext();

let socket;
export default function Game() {
    const params = useParams();
    const [ hand, setHand ] = useState(InitialHand);

    const navigate = useNavigate();
    useEffect(()=> {
        socket = io(`http://localhost:4000/game/${params.id}`);        
        socket.on('connect', () => {
            console.log('connected to Game Server ', params.id);
        });

        return (()=> {
            socket.off('connect');
            socket.disconnect();
        })

    },[params.id])

    useEffect(()=> {
        socket.on('err-game-full', () => {
            alert('Game is full! You`ll be redirected');
            socket.disconnect();
            setTimeout(() => {
                navigate('/');
            }, 3000);
        })

        socket.on('game-over', ()=>{
            alert('Game is over! You`ll be redirected');
            socket.disconnect();
            setTimeout(() => {
                navigate('/');
            }, 3000);
        })

        // Round Initialiazation
        socket.on('game-status-start', ()=>{
            console.log('Game is starting');
        })
        socket.on('dealing-cards', (cards,index) => {
            const newHand = {...hand};
            const newCards = [...hand.cardSlots];
            newCards.splice(0, cards.length, ...cards);
            newHand.didDrawCard = cards.length === 22;
            // console.log(`cards received : `);
            // console.log(newCards);
            newHand.playerIdx = index;
            newHand.isTurn = !index;
            newHand.cardSlots = newCards;
            setHand(newHand);
        })

        socket.on('next-turn-from-server', (whoseTurn,discard_piles) => {
            const newHand = {...hand };
            newHand.whoseTurn = whoseTurn;
            newHand.isTurn = whoseTurn === hand.playerIdx;
            newHand.didDrawCard = whoseTurn !== hand.playerIdx;
            
            newHand.rightPile = discard_piles[newHand.playerIdx]
            newHand.oppRightPile = discard_piles[(newHand.playerIdx+1)%4]
            newHand.leftPile = discard_piles[(newHand.playerIdx+3)%4]
            newHand.oppLeftPile = discard_piles[(newHand.playerIdx+2)%4]
            setHand(newHand);
        })

        socket.on('draw-card-left-from-server',discard_piles => {
            const newHand = {...hand};
            newHand.rightPile = discard_piles[newHand.playerIdx];
            newHand.oppRightPile = discard_piles[(newHand.playerIdx+1)%4];
            newHand.leftPile = discard_piles[(newHand.playerIdx+3)%4];
            newHand.oppLeftPile = discard_piles[(newHand.playerIdx+2)%4];
            newHand.didDrawCard = true;
            setHand(newHand);
        })
        
        socket.on('draw-card-mid-response',newCardSlots => {
            const newHand = {...hand};
            newHand.cardSlots = newCardSlots;
            newHand.didDrawCard = true;
            setHand(newHand);
        })

        return (()=>{
            socket.off('err-game-full');
            socket.off('game-over');
            socket.off('game-status-start');
            socket.off('dealing-cards');
            socket.off('next-turn-from-server')
            socket.off('draw-card-left-from-server');
            socket.off('draw-card-mid-response');
        })
    }, [hand,navigate]) 

    return (
        <HandContext.Provider value={{hand, setHand, socket}}> 
				<DndProvider backend={HTML5Backend}>
                    <PlayerLabels currentPlayerId={hand.playerIdx} whoseTurn={hand.whoseTurn} />
                    <Board />
				</DndProvider>
		</HandContext.Provider>
    );
}