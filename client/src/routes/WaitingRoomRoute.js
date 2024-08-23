import { useEffect, useState } from "react";
import socket from "../sockets/WaitingSocket.js";
import { NavLink, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
export default function WaitingRoom() {
    const [playerCounter, setPlayerCounter] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        socket.connect();
        socket.on('connect', async () => {
            console.log('connected to server');
            // const wallet = window.ethereum;
            // if (wallet) {
            //     const provider = new ethers.BrowserProvider(wallet);
            //     await provider.send('eth_requestAccounts', []);
            //     const signer = provider.getSigner();
            //     const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
            //     const contractAbi = process.env.REACT_APP_CONTRACT_ABI;
            //     const contract = new ethers.Contract(contractAddress, contractAbi, signer);
            //     console.log('contract:', contract);
            //     const tx = await contract.connect(signer)
            //     console.log('tx:', tx);
            //     await tx.joinGame();
            // }
        });
        socket.on('player-counter', counter => {
            setPlayerCounter(counter);
        })
        socket.on('game-start', gameRoomId => {
            navigate(`/game/${gameRoomId}`);
        })

        // socket.on('await-transaction', async () => {
        //     const wallet = window.ethereum;
        //     if (wallet) {
        //         const provider = new ethers.BrowserProvider(wallet);
        //         await provider.send('eth_requestAccounts', []);
        //         const signer = provider.getSigner();
        //         const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
        //         const contractAbi = process.env.REACT_APP_CONTRACT_ABI;
        //         console.log('contractAddress:', contractAddress);
        //         console.log('contractAbi:', contractAbi);
        //         const contract = new ethers.Contract(contractAddress, contractAbi, signer);
        //         console.log('contract:', contract);
        //     }

        // })

        return () => {
            socket.off('connect');
            socket.off('player-counter');
            socket.off('game-start');
            socket.disconnect();
        }
    }, [navigate]);



    return (
        <div className='waiting-menu-container d-flex flex-column m-auto' style={{ height: '100vh' }}>
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