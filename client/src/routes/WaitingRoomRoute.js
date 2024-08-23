import { useEffect, useState } from "react";
import socket from "../sockets/WaitingSocket.js";
import { NavLink, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
export default function WaitingRoom() {
  const [playerCounter, setPlayerCounter] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    socket.connect();
    socket.on("connect", async () => {
      console.log("connected to server");
      //   try {
      //     const wallet = window.ethereum;
      //     if (wallet) {
      //       let inGame = false;
      //       let isReady = false;
      //       const provider = new ethers.BrowserProvider(wallet);
      //       await provider.send("eth_requestAccounts", []);
      //       const signer = await provider.getSigner();
      //       const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      //       const contractAbi = process.env.REACT_APP_CONTRACT_ABI;
      //       const contract = new ethers.Contract(
      //         contractAddress,
      //         contractAbi,
      //         signer
      //       );
      //       const signerAddress = await signer.getAddress();
      //       for (let i = 0; i < 4; i++) {
      //         const playerAddress = await contract.players(i);
      //         if (playerAddress === signerAddress) {
      //           inGame = true;
      //           const ready = await contract.readyStatus(i);
      //           console.log("ready:", ready);
      //           if (ready) {
      //             isReady = true;
      //           } else {
      //             isReady = false;
      //           }
      //         } else inGame = false;
      //       }
      //       if (inGame) {
      //         window.alert("You are already in the game, wait for other players");
      //       } else {
      //         window.alert("Joining game... please sign the transaction");
      //         const tx = await contract.connect(signer).joinGame();
      //         await tx.wait();
      //         window.alert(
      //           "Successfully joined game, please wait for the other players to join"
      //         );
      //       }
      //       if (isReady) {
      //         window.alert(
      //           "You are already ready to play wait for the other players"
      //         );
      //         await kickPlayer();
      //         window.alert("You have been kicked from the game");
      //         window.location.href = "/";
      //       } else {
      //         const ready = await contract.connect(signer).ready();
      //         await ready.wait();
      //         console.log(
      //           "You are ready to play, now please deposit the payment"
      //         );
      //         const amount = ethers.parseEther("0.0001");
      //         const payment = await contract.deposit({ value: amount });
      //         await payment.wait();
      //         console.log("Your payment has been received");
      //       }
      //     }
      //   } catch (e) {
      //     console.log(e);
      //     window.alert("Failed to join game");
      //     await kickPlayer();
      //     window.alert("You have been kicked from the game");
      //     window.location.href = "/";
      //   }
    });
    socket.on("player-counter", (counter) => {
      setPlayerCounter(counter);
    });
    socket.on("game-start", (gameRoomId) => {
      navigate(`/game/${gameRoomId}`);
    });

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
      socket.off("connect");
      socket.off("player-counter");
      socket.off("game-start");
      socket.disconnect();
    };
  }, [navigate]);

  const kickPlayer = async () => {
    const wallet = window.ethereum;
    const providerSigner = new ethers.BrowserProvider(wallet);
    await providerSigner.send("eth_requestAccounts", []);
    const signer = await providerSigner.getSigner();
    const signerAddress = await signer.getAddress();
    const provider = new ethers.JsonRpcProvider(
      "https://sepolia-rpc.scroll.io"
    );

    const owner = new ethers.Wallet(process.env.REACT_APP_OWNER, provider);
    console.log("provider:", provider);
    console.log("owner:", owner);
    const contract = new ethers.Contract(
      process.env.REACT_APP_CONTRACT_ADDRESS,
      process.env.REACT_APP_CONTRACT_ABI,
      signer
    );

    console.log("contract:", contract);
    const players = await contract.getPlayers();
    const readyStatus = await contract.getReadyStatus();
    console.log("players:", players);
    console.log("readyStatus:", readyStatus);
    const tx = await contract.connect(owner).kickPlayer(signerAddress);
    await tx.wait();
    console.log("tx:", tx);
    for (let i = 0; i < 4; i++) {
      console.log("Player address:", players[i]);
      console.log("Ready status:", readyStatus[i]);
    }
    window.alert("You have been kicked from the game");
    window.location.href = "/";
  };

  return (
    <div
      className="waiting-menu-container d-flex flex-column m-auto"
      style={{ height: "100vh" }}
    >
      <h2 className="m-auto text-waiting">
        Waiting for the other player to join... ({" "}
        <strong className="text-danger">{playerCounter}</strong>/4 )
      </h2>
      <NavLink
        className="btn btn-outline-warning go-back-btn m-auto w-25"
        to={"/"}
      >
        Go Back
      </NavLink>
    </div>
  );
}
