import { NavLink } from 'react-router-dom';
import { Row, Col, Container, Button } from 'react-bootstrap';

import { useContext, useEffect } from 'react';
import { AccountContext } from '../App.js';
import { ethers } from 'ethers';


export default function Home() {
    const { account, setAccount, network, setNetwork } = useContext(AccountContext)

    const cards = []
    cards.push(require('../assets/cards/gri1.png'))
    cards.push(require('../assets/cards/turuncu12.png'))
    cards.push(require('../assets/cards/mavi6.png'))
    cards.push(require('../assets/cards/yesil4.png'))
    const diskImg = require('../assets/menu/disk.png')
    const zeroKLogo = require('../assets/menu/0k-logo.png')

    const connectWallet = async () => {
        if (account && network) {
            console.log(account)
        }
        if (window.ethereum) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x8274f' }],
                });

                const provider = new ethers.BrowserProvider(window.ethereum);

                const network = await provider.getNetwork();
                setNetwork(network.name);

                const accounts = await provider.send('eth_requestAccounts', []);

                setAccount(accounts[0]);
                console.log('Connected account:', accounts[0]);
                console.log('Connected to network:', network.name === 'unknown' ? 'Scroll Sepolia' : network.name);
            } catch (error) {
                if (error.code === 4902) {
                    console.error('Sepolia network is not added to MetaMask.');
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x8274f',
                                chainName: 'Scroll Sepolia Testnet',
                                nativeCurrency: {
                                    name: 'SEPOLIA',
                                    symbol: 'ETH',
                                    decimals: 18,
                                },
                                rpcUrls: ["https://sepolia-rpc.scroll.io/"],
                                blockExplorerUrls: ['https://sepolia.scrollscan.com/'],
                            }],
                        });
                        console.log('Scroll Sepolia Testnet added and switched to MetaMask!');
                    } catch (addError) {
                        console.error('Failed to add network:', addError);
                    }
                } else {
                    console.error('Error connecting to MetaMask:', error);
                }
            }
        } else {
            alert('MetaMask is not installed. Please install it to use this app.');
        }
    };

    return (
        <div className='main-menu-container'>
            <Container>
                <Row className='align-items-center vh-100'>
                    <Col xs={5} className='d-flex flex-column gap-4 justify-content-center'>
                        <img className='zeroK-logo' src={zeroKLogo} alt='0k Logo'></img>
                        <NavLink
                            className='btn start-btn m-auto w-75 border-0 scaleUp'
                            to={'/waiting-room'}
                            disabled={!account}
                        >
                        </NavLink>
                        <Button
                            className='btn connect-wallet-btn m-auto w-75 border-0 scaleUp'
                            onClick={connectWallet}
                            disabled={account && network}
                        />
                        <NavLink
                            className='btn tutorial-btn m-auto w-75 border-0 scaleUp'
                            to={'/tutorial'}
                        >
                        </NavLink>
                    </Col>
                    <Col></Col>
                    <Col xs={5} className='d-flex justify-content-center' >
                        <h2 className='connected-wallet-info'>
                            {account && network ? `Connected Wallet: ` : `Wallet is not connected!`}
                            {account && network ? [...account].splice(0, 4) : null}...{account && network ? [...account].splice(-4, 4) : null}
                        </h2>
                        <div className='showcase-container'>
                            <img src={cards[0]} alt="Game Card" draggable={false} />
                            <img src={cards[1]} alt="Game Card" draggable={false} />
                            <img src={cards[2]} alt="Game Card" draggable={false} />
                            <img src={cards[3]} alt="Game Card" draggable={false} />
                            <img src={diskImg} alt="Disk" draggable={false} />
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>

    );
}