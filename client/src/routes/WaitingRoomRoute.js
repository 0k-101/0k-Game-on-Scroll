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

        socket.on('await-transaction', ()=> {

            // if () {
            //     socket.emit('transaction-success')
            // } else {
            //     // some error stuff

            //     socket.emit('transaction-failed')
            //     navigate('/');
            // }

        })

        return ()=> {
            socket.off('connect');
            socket.off('player-counter');
            socket.off('game-start');
            socket.disconnect();
        }
    }, [navigate]);
    
    return (
        <div className='waiting-menu-container d-flex flex-column m-auto' style={{height:'100vh'}}> 
            <h2 className='m-auto text-waiting'>
                Waiting for the other player to join... 
                ( <strong className="text-danger">{playerCounter}</strong>/4 )
            </h2>
            <NavLink className='btn btn-outline-warning go-back-btn m-auto w-25' 
                to={'/'}
                >Go Back</NavLink>
        </div>
    );
}