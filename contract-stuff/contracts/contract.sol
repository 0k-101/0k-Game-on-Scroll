// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OK_101 {
    address[4] public players;
    bool[4] public readyStatus;
    uint8 public playerCount = 0;
    bool public gameStarted = false;
    address public owner;
    event PlayerJoined(address player);
    event PlayerReady(address player);
    event GameStarted(uint256 timestamp);
    event PaymentReceived(address player, uint256 amount);
    event PaymentSent(address player, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized access - not the owner");
        _;
    }
    modifier onlyPlayer() {
        for (uint8 i = 0; i < 4; i++) {
            if (players[i] == msg.sender) {
                _;
                return;
            }
        }
        _;
    }

    function joinGame() public {
        require(playerCount < 4, "Game is already full");
        for (uint8 i = 0; i < 4; i++) {
            require(
                players[i] != msg.sender,
                "Player has already joined the game"
            );
        }
        for (uint8 i = 0; i < 4; i++) {
            if (players[i] == address(0)) {
                players[i] = msg.sender;
                playerCount++;
                emit PlayerJoined(msg.sender);
                return;
            }
        }
    }

    function ready() public onlyPlayer {
        require(
            gameStarted == false,
            "Game has already started - wait for game to end"
        );

        for (uint8 i = 0; i < 4; i++) {
            if (players[i] == msg.sender) {
                require(readyStatus[i] == false, "Player is already ready");
                readyStatus[i] = true;
                emit PlayerReady(msg.sender);
                break;
            }
        }
    }

    function unready() public onlyPlayer {
        require(
            gameStarted == false,
            "Game has already started - wait for next game"
        );
        for (uint8 i = 0; i < 4; i++) {
            if (players[i] == msg.sender) {
                require(readyStatus[i] == true, "Player is not ready");
                readyStatus[i] = false;
                break;
            }
        }
    }

    function checkGameStart() public onlyOwner {
        for (uint8 i = 0; i < 4; i++) {
            if (players[i] == address(0)) {
                return;
            }
            if (readyStatus[i] == false) {
                return;
            }
        }
        gameStarted = true;
        emit GameStarted(block.timestamp);
    }

    function clearGame() public onlyOwner {
        for (uint8 i = 0; i < 4; i++) {
            players[i] = address(0);
            readyStatus[i] = false;
        }
        playerCount = 0;
        gameStarted = false;
    }

    function deposit() public payable onlyPlayer {
        require(
            gameStarted == false,
            "Game has already started - wait for next game"
        );
        require(msg.value > 0, "Deposit amount should be greater than 0");
        emit PaymentReceived(msg.sender, msg.value);
    }

    function sendPayment(
        address payable _to,
        uint256 _amount
    ) public onlyOwner {
        require(
            address(this).balance > 0,
            "Contract balance is 0 - nothing to withdraw"
        );
        _to.transfer(_amount);
        emit PaymentSent(_to, _amount);
    }
}
