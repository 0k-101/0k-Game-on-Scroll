const { expect } = require('chai');
const { ethers } = require('hardhat');
// payments stuff will be fixed
describe("OK_101 Contract Tests", function () {
  let OK_101;
  let ok_101;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let contract
  const contractAddress = process.env.CONTRACT_ADDRESS;
  before(async function () {
    OK_101 = await ethers.getContractFactory("OK_101");
    ok_101 = await OK_101.attach(contractAddress);
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    console.log("Contract deployed to address:", ok_101.target);
    console.log("Owner address:", owner.address);
    let tx = await ok_101.connect(owner).clearGame();
    await tx.wait();
    console.log('Game cleared');
  });

  // it("Should deploy OK_101 contract", async function () {
  //   OK_101 = await ethers.getContractFactory("OK_101");
  //   ok_101 = await OK_101.deploy();
  //   await ok_101.waitForDeployment();
  //   [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
  //   console.log("Contract deployed to address:", ok_101.target);
  //   console.log("Owner address:", owner.address);
  // });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const _owner = await ok_101.owner();
      const ownerAddress = await owner.address;
      console.log("Owner address:", ownerAddress);
      console.log(_owner);
      expect(_owner).to.equal(ownerAddress);
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
      console.log('players : ', await ok_101.players(0));
      expect(await ok_101.players(0)).to.equal(addr1.address);
      expect(await ok_101.playerCount()).to.equal(1);
    });

    it("Should not allow more than 4 players to join", async function () {
      const tx1 = await ok_101.connect(addr2)
      await tx1.joinGame();
      const tx2 = await ok_101.connect(addr3)
      await tx2.joinGame();
      const tx3 = await ok_101.connect(addr4)
      await tx3.joinGame();
      const tx = ok_101.connect(owner);
      for (let i = 0; i < 4; i++) {
        console.log('players : ', await ok_101.players(i));
      }
      expect(await tx.joinGame()).to.be.revertedWith('Game is full');
    });
  });

  describe("Ready/Unready", function () {
    it("Should allow a player to be ready", async function () {
      const tx = await ok_101.connect(addr1)
      await tx.ready()
      const readyStatus = await ok_101.readyStatus(0);
      expect(readyStatus).to.equal(true);
    });

    it("Should allow a player to unready", async function () {
      const tx = await ok_101.connect(addr1)
      await tx.unready()
      const readyStatus = await ok_101.readyStatus(0);
      expect(readyStatus).to.be.revertedWith('Player is not ready');
    });

    it("Should start the game when all players are ready", async function () {
      let txReceipt = await ok_101.connect(addr1)
      await txReceipt.ready()
      txReceipt = await ok_101.connect(addr2)
      await txReceipt.ready()
      txReceipt = await ok_101.connect(addr3)
      await txReceipt.ready()
      txReceipt = await ok_101.connect(addr4)
      await txReceipt.ready()
      const tx = await ok_101.connect(owner)
      await tx.startGame()
      const gameStatus = await ok_101.gameStatus();
      expect(gameStatus).to.equal(true);
    });
  });

  describe("Payments", function () {
    this.beforeEach(async function () {
      const clear = await ok_101.clearGame();
      await clear.wait();
      console.log('Game cleared');
      expect(await ok_101.playerCount()).to.equal(0);
      const p1 = await ok_101.connect(addr1)
      await p1.joinGame();
      const p2 = await ok_101.connect(addr2)
      await p2.joinGame();
      const p3 = await ok_101.connect(addr3)
      await p3.joinGame();
      const p4 = await ok_101.connect(addr4)
      await p4.joinGame();
      for (let i = 0; i < 4; i++) {
        console.log('players : ', await ok_101.players(i));
      }
      console.log('All players joined');
    }
    );
    it("Should receive payment", async function () {
      await expect(() =>
        ok_101.connect(addr1).deposit({ value: ethers.parseEther("0.0001") })
      ).to.emit(ok_101, 'PaymentReceived').withArgs(addr1.address, ethers.parseEther("0.0001"));

    });

    it("Should send payment", async function () {
      await ok_101.connect(addr1).deposit({ value: ethers.parseEther("0.0001") });
      await ok_101.connect(addr2).deposit({ value: ethers.parseEther("0.0001") });
      await ok_101.connect(addr3).deposit({ value: ethers.parseEther("0.0001") });
      await ok_101.connect(addr4).deposit({ value: ethers.parseEther("0.0001") });

      let initialBalance = await ethers.provider.getBalance(addr1.address);

      await expect(ok_101.connect(owner).sendPayment(addr1.address, ethers.parseEther("0.0004"))).to.emit(ok_101, 'PaymentSent').withArgs(addr1.address, ethers.parseEther("0.0004"));

      const finalBalance = await ethers.provider.getBalance(addr1.address);
      expect(finalBalance).to.equal(initialBalance + (ethers.parseEther("0.0004")));
    });
  });
});
