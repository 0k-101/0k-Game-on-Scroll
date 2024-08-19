import { useEffect,useState } from "react";
import socket from "../sockets/WaitingSocket.js";
import { NavLink,useNavigate } from 'react-router-dom';

export default function WaitingRoom() {
    const [playerCounter, setPlayerCounter] = useState(0);
    const navigate = useNavigate();

    useEffect( () => {
        socket.connect();
        socket.on('connect', () => {
            console.log('connected to server');
        });
        socket.on('player-counter', counter => {
            setPlayerCounter(counter);
        })
        socket.on('game-start', gameRoomId => {
            navigate(`/game/${gameRoomId}`);
        })

        return ()=> {
            socket.off('connect');
            socket.off('player-counter');
            socket.off('game-start');
            socket.disconnect();
        }
    }, [navigate]);
    
    return (
        <div className='d-flex flex-column gap-4 w-25 m-auto' style={{height:'100vh'}}> 
            <h2>
                Waiting for the other player to join... ({playerCounter}/4)
            </h2>
            <NavLink className='btn btn-danger my-auto' 
                to={'/'}
                >Go back</NavLink>
            <NavLink className='btn btn-secondary my-auto' 
                to={'/game'}
                >Go Next</NavLink>
        </div>
    );
}