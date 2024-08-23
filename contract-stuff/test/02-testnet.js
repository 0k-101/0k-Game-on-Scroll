const { ok } = require("assert");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OK_101 Contract Tests", function () {
  let OK_101;
  let ok_101;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;

  const contractAddress = process.env.CONTRACT_ADDRESS;
  beforeEach(async function () {
    if (contractAddress !== "") {
      OK_101 = await ethers.getContractFactory("OK_101");
      ok_101 = await OK_101.attach(contractAddress);
      [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
      console.log("Contract attached to address:", contractAddress);
      const tx = await ok_101.connect(owner).clearGame({ gasLimit: 400000 });
      await tx.wait();
      console.log("Game cleared:");
    } else {
      OK_101 = await ethers.getContractFactory("OK_101");
      ok_101 = await OK_101.deploy();
      await ok_101.waitForDeployment();
      [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
      console.log("Contract deployed/attached to address:", ok_101.target);
      console.log("Owner address:", owner.address);
    }
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
      await tx.wait(); // Wait for the transaction to be mined
      const player = await ok_101.players(0);
      expect(player).to.equal(addr1.address);
      const playerCount = await ok_101.playerCount();
      expect(playerCount).to.equal(1);
    });

    it("Should not allow more than 4 players to join", async function () {
      await (await ok_101.connect(addr1).joinGame({ gasLimit: 300000 })).wait();
      console.log("Player 1 joined :", await ok_101.players(0));
      await (await ok_101.connect(addr2).joinGame({ gasLimit: 300000 })).wait();
      console.log("Player 2 joined :", await ok_101.players(1));
      await (await ok_101.connect(addr3).joinGame({ gasLimit: 300000 })).wait();
      console.log("Player 3 joined :", await ok_101.players(2));
      await (await ok_101.connect(addr4).joinGame({ gasLimit: 300000 })).wait();
      console.log("Player 4 joined :", await ok_101.players(3));
      expect(
        await ok_101.connect(owner).joinGame({ gasLimit: 300000 })
      ).to.be.revertedWith("Game is already full");
    });
  });

  describe("Ready/Leave Game", function () {
    it("Should allow a player to be ready", async function () {
      await (await ok_101.connect(addr1).joinGame({ gasLimit: 300000 })).wait();
      await (await ok_101.connect(addr1).ready({ gasLimit: 200000 })).wait();
      const readyStatus = await ok_101.readyStatus(0);
      expect(readyStatus).to.equal(true);
    });

    it("Should allow a player to leave", async function () {
      console.log("Ready status:", await ok_101.readyStatus(0));

      await (await ok_101.connect(addr1).joinGame({ gasLimit: 300000 })).wait();
      await (await ok_101.connect(addr1).ready({ gasLimit: 200000 })).wait();
      const tx = await ok_101.connect(addr1).leaveGame({ gasLimit: 200000 });
      expect(tx).to.emit(ok_101, "PlayerLeft").withArgs(addr1.address);
      await tx.wait();
      const readyStatus = await ok_101.readyStatus(0);
      console.log(await ok_101.players(0));
      expect(readyStatus).to.equal(false);
      const player = await ok_101.players(0);
      expect(player).to.equal(ethers.ZeroAddress);
    });
    it("Should kick the player if they are not ready", async function () {
      await (await ok_101.connect(addr1).joinGame({ gasLimit: 300000 })).wait();
      const tx = await ok_101
        .connect(owner)
        .kickPlayer(addr1.address, { gasLimit: 200000 });
      expect(tx).to.emit(ok_101, "PlayerKicked").withArgs(addr1.address);
      await tx.wait();
      const player = await ok_101.players(0);
      expect(player).to.equal(ethers.ZeroAddress);
    });

    it("Should start the game when all players are ready", async function () {
      await (await ok_101.connect(addr1).joinGame({ gasLimit: 300000 })).wait();
      console.log("Player 1 joined :", await ok_101.players(0));
      await (await ok_101.connect(addr2).joinGame({ gasLimit: 300000 })).wait();
      console.log("Player 2 joined :", await ok_101.players(1));
      await (await ok_101.connect(addr3).joinGame({ gasLimit: 300000 })).wait();
      console.log("Player 3 joined :", await ok_101.players(2));
      await (await ok_101.connect(addr4).joinGame({ gasLimit: 300000 })).wait();
      console.log("Player 4 joined :", await ok_101.players(3));
      await (await ok_101.connect(addr1).ready({ gasLimit: 200000 })).wait();
      console.log("Player 1 ready :", await ok_101.readyStatus(0));
      await (await ok_101.connect(addr2).ready({ gasLimit: 200000 })).wait();
      console.log("Player 2 ready :", await ok_101.readyStatus(1));
      await (await ok_101.connect(addr3).ready({ gasLimit: 200000 })).wait();
      console.log("Player 3 ready :", await ok_101.readyStatus(2));
      await (await ok_101.connect(addr4).ready({ gasLimit: 200000 })).wait();
      console.log("Player 4 ready :", await ok_101.readyStatus(3));
      const startTx = await ok_101
        .connect(owner)
        .checkGameStart({ gasLimit: 400000 });
      await startTx.wait();
      const gameStarted = await ok_101.gameStarted();
      expect(gameStarted).to.equal(true);
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
      console.log("Players joined:", await ok_101.playerCount());
    });

    it("Should receive payment", async function () {
      const depositTx = await ok_101
        .connect(addr1)
        .deposit({ value: ethers.parseEther("0.0001"), gasLimit: 200000 });
      await depositTx.wait();
      expect(depositTx)
        .to.emit(ok_101, "PaymentReceived")
        .withArgs(addr1.address, ethers.parseEther("0.0001"));
    });

    it("Should send payment", async function () {
      expect(
        await ok_101
          .connect(addr1)
          .deposit({ value: ethers.parseEther("0.0001"), gasLimit: 200000 })
      )
        .to.emit(ok_101, "PaymentReceived")
        .withArgs(addr1.address, ethers.parseEther("0.0001"));
      expect(
        await ok_101
          .connect(addr2)
          .deposit({ value: ethers.parseEther("0.0001"), gasLimit: 200000 })
      )
        .to.emit(ok_101, "PaymentReceived")
        .withArgs(addr2.address, ethers.parseEther("0.0001"));
      expect(
        await ok_101
          .connect(addr3)
          .deposit({ value: ethers.parseEther("0.0001"), gasLimit: 200000 })
      )
        .to.emit(ok_101, "PaymentReceived")
        .withArgs(addr3.address, ethers.parseEther("0.0001"));
      expect(
        await ok_101
          .connect(addr4)
          .deposit({ value: ethers.parseEther("0.0001"), gasLimit: 200000 })
      )
        .to.emit(ok_101, "PaymentReceived")
        .withArgs(addr4.address, ethers.parseEther("0.0001"));

      console.log("All users deposited");
      const provider = new ethers.JsonRpcProvider(
        "https://sepolia-rpc.scroll.io/"
      );

      const initialBalance = await provider.getBalance(addr1.address);
      console.log("Initial balance:", initialBalance);

      await ok_101
        .connect(owner)
        .sendPayment(addr1.address, ethers.parseEther("0.0004"), {
          gasLimit: 200000,
        })
        .then((tx) => tx.wait());

      const finalBalance = await provider.getBalance(addr1.address);
      console.log("Final balance:", finalBalance);
      expect(finalBalance).to.be.above(initialBalance);
    });
  });
});
