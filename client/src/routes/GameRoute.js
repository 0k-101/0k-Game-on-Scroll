import { useEffect, useState, createContext } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { io } from 'socket.io-client';

import Board from '../components/Board';
import PerFinder from '../components/PerFinder';
import OverviewPanel from '../components/OverviewPanel';
import PlayerLabels from '../components/PlayerLabels'
import {InitialHand,InitialTables} from "../constants/Initials";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export const HandContext = createContext();

let socket;
export default function Game() {
    const params = useParams();
    const [hand, setHand] = useState(InitialHand);
    const [tables, setTables] = useState(InitialTables);
    const [midCounter, setMidCounter ]= useState(20);
    const [modalShow,setModalShow] = useState(false);
    const [endModalShow,setEndModalShow] = useState(false);
    const [roundInfos,setRoundInfos] = useState({roundNum:0,roundScores:[0,0,0,0]});
    const [clock,setClock] = useState(0);

    const navigate = useNavigate();
    useEffect(() => {
        socket = io(`http://localhost:4000/game/${params.id}`);
        socket.on("connect", () => {
            console.log("connected to Game Server ", params.id);
        });

        return (() => {
            socket.off('connect');
            socket.disconnect();
        })

    }, [params.id])

    useEffect(() => {
        socket.on('err-game-full', () => {
            alert('Game is full! You`ll be redirected');
            socket.disconnect();
            setTimeout(() => {
                navigate('/');
            }, 3000);
        })

        socket.on('game-over', () => {
            alert('Game is over! You`ll be redirected');
            socket.disconnect();
            setTimeout(() => {
                navigate('/');
            }, 3000);
        })
        
        // Round Initialiazation
        socket.on('game-status-start', () => {
            console.log('Game is starting');
        })
        socket.on('dealing-cards', (cards, index) => {
            const newHand = { ...InitialHand };
            const newCards = [...newHand.cardSlots];
            newCards.splice(0, cards.length, ...cards);
            if (cards.length === 22) {
                newHand.didDrawCard = true;
            }
            // console.log(`cards received : `);
            // console.log(newCards);
            newHand.playerIdx = index;
            newHand.isTurn = !index;
            newHand.cardSlots = newCards;
            setHand(newHand);
        })
        
        socket.on('next-turn-from-server', (whoseTurn, discard_piles) => {
            const newHand = { ...hand };
            newHand.whoseTurn = whoseTurn;
            newHand.isTurn = whoseTurn === hand.playerIdx;
            if (newHand.isTurn) {
                newHand.didDrawCard = false;
            }
            newHand.rightPile = discard_piles[newHand.playerIdx]
            newHand.oppRightPile = discard_piles[(newHand.playerIdx + 1) % 4]
            newHand.leftPile = discard_piles[(newHand.playerIdx + 3) % 4]
            newHand.oppLeftPile = discard_piles[(newHand.playerIdx + 2) % 4]
            setHand(newHand);
        })
        
        socket.on('next-turn-error', (err,cards,discardPile) => {
            // @TODO:
            // show up a toast notification
            console.error(err);
            const newHand = { ...hand };
            newHand.cardSlots = cards;
            newHand.rightPile = discardPile;
            console.log(newHand.rightPile);
            setHand(newHand);
        })
        
        socket.on('draw-card-left-from-server', (discard_piles,pIdx) => {
            // pIdx: player's index who drew the card
            const newHand = { ...hand };
            newHand.rightPile = discard_piles[newHand.playerIdx];
            newHand.oppRightPile = discard_piles[(newHand.playerIdx + 1) % 4];
            newHand.leftPile = discard_piles[(newHand.playerIdx + 3) % 4];
            newHand.oppLeftPile = discard_piles[(newHand.playerIdx + 2) % 4];
            
            newHand.didDrawCard = true;
            setHand(newHand);
        })

        socket.on('draw-card-left-error', (newCardsSlots,newLeftPile) => {
            // @TODO:
            // show up a toast notification
            const newHand = { ...hand };
            newHand.cardSlots = newCardsSlots;
            newHand.didDrawCard = false;
            newHand.leftPile = newLeftPile;
            setHand(newHand);
        })
        
        socket.on('draw-card-mid-response', newCardSlots => {
            const newHand = { ...hand };
            newHand.cardSlots = newCardSlots;
            newHand.didDrawCard = true;
            setHand(newHand);
        })

        socket.on('draw-card-mid-response-to-all', midLeftCount => {
            setMidCounter(midLeftCount);
        })

        socket.on('open-hand-response-to-all',tables => {
            setTables(tables);
        });
        socket.on('open-hand-response-to-client',newCardSlots=>{
            const newHand = {...hand};
            newHand.cardSlots = newCardSlots;
            newHand.hasOpened = true;
            setHand(newHand);
        })

        socket.on('end-round',(roundNum,roundScores)=>{
            console.log('Round Over');
            
            setRoundInfos({roundNum,roundScores});
            
            if (roundNum <= 4) {
                setModalShow(true);
                let clk = 45;
                setInterval(()=> {
                    setClock(clk => clk - 1);
                    if (clk === 0) {
                        setModalShow(false);
                    }
                },1000)
            } else {
                setEndModalShow(true);
            }
        })
        
        return (() => {
            socket.off('err-game-full');
            socket.off('game-over');
            socket.off('game-status-start');
            socket.off('dealing-cards');
            socket.off('next-turn-from-server')
            socket.off('draw-card-left-from-server');
            socket.off('draw-card-mid-response');
            socket.off('next-turn-error');
            socket.off('draw-card-left-error');
            socket.off('open-hand-response-to-all');
            socket.off('open-hand-response-to-client');
            socket.off('draw-card-mid-response-to-all');
        })
    }, [hand, navigate])
    
    return (
        <div className="game-route-bg">

            <HandContext.Provider value={{ hand, setHand, socket, tables,setTables,midCounter }}>
                <DndProvider backend={HTML5Backend}>
                    <Modal show={modalShow} onHide={()=>setModalShow(false)}
                        dialogClassName="modal-dialog modal-xl"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        >
                        
                        <Modal.Body >
                            <div className="round-over-container">
                                <div className="round-over-content text-center">
                                    <h1>Round Over</h1>
                                    <h2>Round Number: {roundInfos.roundNum}</h2>
                                    <h3>Round Scores</h3>
                                    <ul>
                                        <li>Player 1: {roundInfos.roundScores[0]}</li>
                                        <li>Player 2: {roundInfos.roundScores[1]}</li>
                                        <li>Player 3: {roundInfos.roundScores[2]}</li>
                                        <li>Player 4: {roundInfos.roundScores[3]}</li>
                                    </ul>
                                    <h3>Next Round will start in {clock} seconds</h3>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>
                    <Modal show={endModalShow} onHide={()=>setModalShow(false)}
                        dialogClassName="modal-dialog modal-xl"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        >
                        
                        <Modal.Body >
                            <div className="round-over-container">
                                <div className="round-over-content text-center">
                                    <h1>Round Over</h1>
                                    <h2>Round Number: {roundInfos.roundNum}</h2>
                                    <h3>Round Scores</h3>
                                    <ul>
                                        <li>Player 1: {roundInfos.roundScores[0]}</li>
                                        <li>Player 2: {roundInfos.roundScores[1]}</li>
                                        <li>Player 3: {roundInfos.roundScores[2]}</li>
                                        <li>Player 4: {roundInfos.roundScores[3]}</li>
                                    </ul>
                                    <h3>Next Round will start in {clock} seconds</h3>
                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>
                    <PlayerLabels currentPlayerId={hand.playerIdx} whoseTurn={hand.whoseTurn} />
                    <OverviewPanel />
                    <PerFinder />
                    <Board midCounter={midCounter}/>
                </DndProvider>
            </HandContext.Provider>
        </div>
    );
}