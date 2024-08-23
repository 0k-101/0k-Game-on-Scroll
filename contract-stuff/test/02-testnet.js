const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("OK_101 Contract Tests", function () {
    let OK_101;
    let ok_101;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addr4;

    // const contractAddress = process.env.CONTRACT_ADDRESS;
    let contractAddress
    beforeEach(async function () {
        const network = await ethers.provider.getNetwork();
        console.log('Network:', network.name);
        console.log('Chain ID:', network.chainId);
        if (contractAddress) {
            OK_101 = await ethers.getContractFactory("OK_101");
            ok_101 = await OK_101.attach(contractAddress);
            contractAddress = ok_101.target
            console.log('Contract attached to address:', contractAddress);
        } else {
            OK_101 = await ethers.getContractFactory("OK_101");
            ok_101 = await OK_101.deploy();
            await ok_101.waitForDeployment();
        }

        [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

        console.log("Contract deployed/attached to address:", ok_101.target);
        console.log("Owner address:", owner.address);
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const _owner = await ok_101.owner();
            expect(_owner).to.equal(owner.address);
            expect(await ok_101.players(0)).to.equal(ethers.ZeroAddress);
        });

        it("Should have player count zero", async function () {
            expect(await ok_101.playerCount()).to.equal(0);
        });
    });

    describe("Join Game", function () {
        it("Should allow a player to join the game", async function () {
            const tx = await ok_101.connect(addr1).joinGame({ gasLimit: 300000 });
            const receipt = await tx.wait(); // Wait for the transaction to be mined
            expect(receipt.status).to.equal(1); // Ensure the transaction was successful
            expect(await ok_101.players(0)).to.equal(addr1.address);
            expect(await ok_101.playerCount()).to.equal(1);
        });

        it("Should not allow more than 4 players to join", async function () {
            await (await ok_101.connect(addr1).joinGame({ gasLimit: 300000 })).wait();
            await (await ok_101.connect(addr2).joinGame({ gasLimit: 300000 })).wait();
            await (await ok_101.connect(addr3).joinGame({ gasLimit: 300000 })).wait();
            await (await ok_101.connect(addr4).joinGame({ gasLimit: 300000 })).wait();

            await expect(ok_101.connect(owner).joinGame({ gasLimit: 300000 })).to.be.revertedWith('Game is full');
        });
    });

    describe("Ready/Unready", function () {
        it("Should allow a player to be ready", async function () {
            await (await ok_101.connect(addr1).joinGame({ gasLimit: 300000 })).wait();
            await (await ok_101.connect(addr1).ready({ gasLimit: 200000 })).wait();
            const readyStatus = await ok_101.readyStatus(0);
            expect(readyStatus).to.equal(true);
        });

        it("Should allow a player to unready", async function () {
            await (await ok_101.connect(addr1).joinGame({ gasLimit: 300000 })).wait();
            await (await ok_101.connect(addr1).ready({ gasLimit: 200000 })).wait();
            await (await ok_101.connect(addr1).unready({ gasLimit: 200000 })).wait();
            const readyStatus = await ok_101.readyStatus(0);
            expect(readyStatus).to.equal(false);
        });

        it("Should start the game when all players are ready", async function () {
            await (await ok_101.connect(addr1).joinGame({ gasLimit: 300000 })).wait();
            await (await ok_101.connect(addr2).joinGame({ gasLimit: 300000 })).wait();
            await (await ok_101.connect(addr3).joinGame({ gasLimit: 300000 })).wait();
            await (await ok_101.connect(addr4).joinGame({ gasLimit: 300000 })).wait();

            await (await ok_101.connect(addr1).ready({ gasLimit: 200000 })).wait();
            await (await ok_101.connect(addr2).ready({ gasLimit: 200000 })).wait();
            await (await ok_101.connect(addr3).ready({ gasLimit: 200000 })).wait();
            await (await ok_101.connect(addr4).ready({ gasLimit: 200000 })).wait();

            const startTx = await ok_101.connect(owner).startGame({ gasLimit: 400000 });
            const receipt = await startTx.wait();
            expect(receipt.status).to.equal(1);
            const gameStatus = await ok_101.gameStatus();
            expect(gameStatus).to.equal(true);
        });
    });

    describe("Payments", function () {
        beforeEach(async function () {
            const clear = await ok_101.clearGame({ gasLimit: 400000 });
            await clear.wait();

            await (await ok_101.connect(addr1).joinGame({ gasLimit: 300000 })).wait();
            await (await ok_101.connect(addr2).joinGame({ gasLimit: 300000 })).wait();
            await (await ok_101.connect(addr3).joinGame({ gasLimit: 300000 })).wait();
            await (await ok_101.connect(addr4).joinGame({ gasLimit: 300000 })).wait();
        });

        it("Should receive payment", async function () {
            const depositTx = await ok_101.connect(addr1).deposit({ value: ethers.parseEther("0.0001"), gasLimit: 200000 });
            const receipt = await depositTx.wait();
            expect(receipt.status).to.equal(1);
            await expect(depositTx)
                .to.emit(ok_101, 'PaymentReceived')
                .withArgs(addr1.address, ethers.parseEther("0.0001"));
        });

        it("Should send payment", async function () {
            await (await ok_101.connect(addr1).deposit({ value: ethers.parseEther("0.0001"), gasLimit: 200000 })).wait();
            await (await ok_101.connect(addr2).deposit({ value: ethers.parseEther("0.0001"), gasLimit: 200000 })).wait();
            await (await ok_101.connect(addr3).deposit({ value: ethers.parseEther("0.0001"), gasLimit: 200000 })).wait();
            await (await ok_101.connect(addr4).deposit({ value: ethers.parseEther("0.0001"), gasLimit: 200000 })).wait();

            const initialBalance = await ethers.provider.getBalance(addr1.address);

            const paymentTx = await ok_101.connect(owner).sendPayment(addr1.address, ethers.parseEther("0.0004"), { gasLimit: 200000 });
            const receipt = await paymentTx.wait();
            expect(receipt.status).to.equal(1);
            await expect(paymentTx)
                .to.emit(ok_101, 'PaymentSent')
                .withArgs(addr1.address, ethers.parseEther("0.0004"));

            const finalBalance = await ethers.provider.getBalance(addr1.address);
            expect(finalBalance).to.be.above(initialBalance);
        });
    });
});
