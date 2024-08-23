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

    beforeEach(async function () {
        // Deploy the contract before each test
        OK_101 = await ethers.getContractFactory("OK_101");
        ok_101 = await OK_101.deploy();
        await ok_101.waitForDeployment();
        // Get the local signers (accounts)
        [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
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
            const tx = await ok_101.connect(addr1).joinGame();
            await tx.wait();
            expect(await ok_101.players(0)).to.equal(addr1.address);
            expect(await ok_101.playerCount()).to.equal(1);
        });

        it("Should not allow more than 4 players to join", async function () {
            await ok_101.connect(addr1).joinGame();
            await ok_101.connect(addr2).joinGame();
            await ok_101.connect(addr3).joinGame();
            await ok_101.connect(addr4).joinGame();

            await expect(ok_101.connect(owner).joinGame()).to.be.revertedWith('Game is already full');
        });
    });

    describe("Ready/Unready", function () {
        it("Should allow a player to be ready", async function () {
            await ok_101.connect(addr1).joinGame();
            await ok_101.connect(addr1).ready();
            const readyStatus = await ok_101.readyStatus(0);
            expect(readyStatus).to.equal(true);
        });

        it("Should allow a player to unready", async function () {
            await ok_101.connect(addr1).joinGame();
            await ok_101.connect(addr1).ready();
            await ok_101.connect(addr1).unready();
            const readyStatus = await ok_101.readyStatus(0);
            expect(readyStatus).to.equal(false);
        });

        it("Should start the game when all players are ready", async function () {
            await ok_101.connect(addr1).joinGame();
            await ok_101.connect(addr2).joinGame();
            await ok_101.connect(addr3).joinGame();
            await ok_101.connect(addr4).joinGame();

            await ok_101.connect(addr1).ready();
            await ok_101.connect(addr2).ready();
            await ok_101.connect(addr3).ready();
            await ok_101.connect(addr4).ready();

            await ok_101.connect(owner).checkGameStart();
            console.log
            const gameStatus = await ok_101.gameStarted();
            expect(gameStatus).to.equal(true);
        });
    });

    describe("Payments", function () {
        beforeEach(async function () {
            await ok_101.connect(addr1).joinGame();
            await ok_101.connect(addr2).joinGame();
            await ok_101.connect(addr3).joinGame();
            await ok_101.connect(addr4).joinGame();
        });

        it("Should receive payment", async function () {
            await expect(() =>
                ok_101.connect(addr1).deposit({ value: ethers.parseEther("0.0001") })
            ).to.changeEtherBalance(ok_101, ethers.parseEther("0.0001"));
        });

        it("Should send payment", async function () {
            await ok_101.connect(addr1).deposit({ value: ethers.parseEther("0.0001") });
            await ok_101.connect(addr2).deposit({ value: ethers.parseEther("0.0001") });
            await ok_101.connect(addr3).deposit({ value: ethers.parseEther("0.0001") });
            await ok_101.connect(addr4).deposit({ value: ethers.parseEther("0.0001") });

            const initialBalance = await ethers.provider.getBalance(addr1.address);

            await expect(ok_101.connect(owner).sendPayment(addr1.address, ethers.parseEther("0.0004")))
                .to.emit(ok_101, 'PaymentSent')
                .withArgs(addr1.address, ethers.parseEther("0.0004"));

            const finalBalance = await ethers.provider.getBalance(addr1.address);
            expect(finalBalance).to.be.greaterThan(initialBalance);
        });
    });
});
