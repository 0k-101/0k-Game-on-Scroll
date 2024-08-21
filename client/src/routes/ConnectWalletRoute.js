import React, { useState } from 'react';
import { ethers } from 'ethers';

const ConnectWallet = () => {
    const [account, setAccount] = useState(null);
    const [network, setNetwork] = useState(null);
    if (account && network) {
        window.location.href = '/'; // Replace '/main-page' with the actual URL of your main page
        alert('Already Connected to MetaMask');
    }

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xaa36a7' }], // Sepolia Testnet chainId is 0xaa36a7 (hex for 11155111)
                });

                const provider = new ethers.BrowserProvider(window.ethereum);

                const network = await provider.getNetwork();
                setNetwork(network.name);

                const accounts = await provider.send('eth_requestAccounts', []);

                setAccount(accounts[0]);
                console.log('Connected account:', accounts[0]);
                console.log('Connected to network:', network.name);
            } catch (error) {
                if (error.code === 4902) {
                    console.error('Sepolia network is not added to MetaMask.');
                } else {
                    console.error('Error connecting to MetaMask:', error);
                }
            }
        } else {
            alert('MetaMask is not installed. Please install it to use this app.');
        }
    };

    return (
        <div className="container">
            <h1>Connect Wallet</h1>
            <button onClick={connectWallet}>Connect Wallet</button>
            {account && <p>Connected account: {account}</p>}
            {network && <p>Connected to network: {network}</p>}
        </div>
    );
};

export default ConnectWallet;
