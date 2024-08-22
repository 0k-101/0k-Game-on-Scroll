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
  let addr5;

  it("Should deploy OK_101 contract", async function () {
    OK_101 = await ethers.getContractFactory("OK_101");
    ok_101 = await OK_101.deploy();
    await ok_101.waitForDeployment();
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    console.log("Contract deployed to address:", ok_101.target);
    console.log("Owner address:", owner.address);
  });

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
      const tx1 = await ok_101.connect(addr2).joinGame();
      await tx1.wait();
      console.log('players : ', await ok_101.players(1));
      const tx2 = await ok_101.connect(addr3).joinGame();
      await tx2.wait();
      console.log('players : ', await ok_101.players(2));
      const tx3 = await ok_101.connect(addr4).joinGame();
      await tx3.wait();
      console.log('players : ', await ok_101.players(3));
      const tx = ok_101.connect(owner);
      await expect(tx.joinGame()).to.be.revertedWith("Game is already full");

    });
  });

  describe("Ready/Unready", function () {
    it("Should allow a player to be ready", async function () {
      const tx = await ok_101.connect(addr1).ready()
      await tx.wait();
      expect(await ok_101.readyStatus(0)).to.equal(true);
    });

    it("Should allow a player to unready", async function () {
      const tx = await ok_101.connect(addr1).unready()
      await tx.wait();
      expect(await ok_101.readyStatus(0)).to.be.revertedWith('Player is not ready');
    });

    it("Should start the game when all players are ready", async function () {
      let txReceipt = await ok_101.connect(addr1).ready()
      await txReceipt.wait()
      txReceipt = await ok_101.connect(addr2).ready()
      await txReceipt.wait()
      txReceipt = await ok_101.connect(addr3).ready()
      await txReceipt.wait()
      txReceipt = await ok_101.connect(addr4).ready()
      await txReceipt.wait()
      const tx = await ok_101.connect(owner).checkGameStart()
      await tx.wait()
      await expect(await ok_101.gameStarted()).to.equal(true);

    });
  });

  describe("Payments", function () {
    this.beforeEach(async function () {
      const clear = await ok_101.clearGame();
      await clear.wait();
      console.log('Game cleared');
      expect(await ok_101.playerCount()).to.equal(0);
      const p1 = await ok_101.connect(addr1).joinGame();
      await p1.wait();
      const p2 = await ok_101.connect(addr2).joinGame();
      await p2.wait();

      const p3 = await ok_101.connect(addr3).joinGame();
      await p3.wait();
      const p4 = await ok_101.connect(addr4).joinGame();
      await p4.wait();
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
