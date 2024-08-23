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
                    params: [{ chainId: '0x8274f' }], // Sepolia Testnet chainId is 0xaa36a7 (hex for 11155111)
                });
                const provider = new ethers.BrowserProvider(window.ethereum);
                const network = await provider.getNetwork();
                setNetwork(network.name);

                const accounts = await provider.send('eth_requestAccounts', []);

                setAccount(accounts[0]);
                console.log('Connected account:', accounts[0]);
                console.log('Connected to network:', network.name);
                console.log('Chain ID:', network.chainId);

            } catch (error) {
                if (error.code === 4902) {
                    console.error('Scroll Sepolia network is not added to MetaMask.');
                } else {
                    console.error('Error connecting to MetaMask:', error);
                }
            }
        } else {
            alert('MetaMask is not installed. Please install it to use this app.');
        }
    };
    const switchScroll = async () => {
        if (window.ethereum) {
            try {
                const chainId = '0x8274f'; // Replace with the actual chain ID in hexadecimal
                // Check if the network is already added
                const networks = await window.ethereum.request({ method: 'eth_chainId' });
                console.log('Connected accounta:', accounts[0]);
                console.log('Connected to networka:', network.name);
                console.log('Chain IDa:', network.chainId);

                if (networks === chainId) {
                    console.log('Already on Scroll Sepolia Testnet.');
                } else {
                    // Try to switch to Scroll Sepolia Testnet
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId }],
                    });
                    console.log('Switched to Scroll Sepolia Testnet.');
                }
            } catch (error) {
                if (error.code === 4902) {
                    // Network is not added, so add it
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x8274f', // Replace with the actual chain ID in hexadecimal
                                chainName: 'Scroll Sepolia Testnet',
                                nativeCurrency: {
                                    name: 'SEPOLIA',
                                    symbol: 'SEPOLIA',
                                    decimals: 18,
                                },
                                rpcUrls: ["https://sepolia-rpc.scroll.io/"], // Replace with the actual RPC URL
                                blockExplorerUrls: ['https://sepolia.scrollscan.com/'], // Replace with the actual block explorer URL
                            }],
                        });
                        console.log('Scroll Sepolia Testnet added and switched to MetaMask!');
                    } catch (addError) {
                        console.error('Failed to add network:', addError);
                    }
                } else {
                    console.error('Failed to switch network:', error);
                }
            }
        } else {
            console.error('MetaMask is not installed.');
        }
    }

    return (
        <div className="container">
            <h1>Connect Wallet</h1>
            <button onClick={switchScroll}>Connect Wallet</button>
            {account && <p>Connected account: {account}</p>}
            {network && <p>Connected to network: {network}</p>}
        </div>
    );
};

export default ConnectWallet;
