import { useEffect, useState, createContext } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import Board from '../components/Board';
import PerFinder from '../components/PerFinder';
import PlayerLabels from '../components/PlayerLabels'
import {InitialHand,InitialTables} from "../constants/Initials";
import OverviewPanel from '../components/OverviewPanel';


export const HandContext = createContext();

export default function Test(){

    const [hand,setHand] = useState(InitialHand);
    const [tables,setTables] = useState(InitialTables);  

    return (
        <HandContext.Provider value={{hand}}>
            <DndProvider backend={HTML5Backend}>
                    <PlayerLabels currentPlayerId={hand.playerIdx} whoseTurn={hand.whoseTurn} />
                    <OverviewPanel />
                    {/* <PerFinder /> */}
                    <Board />
            </DndProvider>
        </HandContext.Provider>
    )
}