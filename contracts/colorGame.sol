//SPDX-License-Identifier:MIT
pragma solidity ^0.8.19;

error NotAuthorized();
error GameAlreadyWon();
error NoAttemptsLeft();
error InvalidBottle();
error GameNotStarted();

contract BottleGame {
    struct GameState {
        uint8[5] sequence;
        uint8 attempts;
        bool active;
        bool won;
        uint256 lastShuffle;
    }

    mapping(address => GameState) private games;

    event Result(address indexed player, uint8 correct);
    event NewGame(address indexed player);

    uint256 private nonce;

    function play(uint8[5] calldata guess) external returns (uint8) {
        GameState storage game = games[msg.sender];

        if (!game.active) revert GameNotStarted();
        if (game.won) revert GameAlreadyWon();
        if (game.attempts == 0) revert NoAttemptsLeft();

        for (uint8 i; i < 5; ++i) {
            if (guess[i] == 0 || guess[i] > 5) revert InvalidBottle();
        }

        uint8 matches;
        for (uint8 i; i < 5; ++i) {
            if (guess[i] == game.sequence[i]) {
                unchecked {
                    ++matches;
                }
            }
        }

        unchecked {
            --game.attempts;
        }

        if (matches == 5) {
            game.won = true;
        } else if (game.attempts == 0) {
            _initGame(msg.sender);
        }

        emit Result(msg.sender, matches);
        return matches;
    }

    function startGame() external {
        _initGame(msg.sender);
        emit NewGame(msg.sender);
    }

    function _initGame(address player) private {
        uint8[5] memory seq;
        for (uint8 i; i < 5; ++i) {
            seq[i] = i + 1;
        }

        // Enhanced shuffle using multiple entropy sources
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.number,
                    player,
                    address(this),
                    nonce++,
                    blockhash(block.number - 1),
                    tx.gasprice
                )
            )
        );

        // Fisher-Yates with multiple rounds
        for (uint8 round = 0; round < 3; round++) {
            for (uint8 i = 4; i > 0; --i) {
                seed = uint256(keccak256(abi.encodePacked(seed, i)));
                uint8 j = uint8(seed % (i + 1));
                (seq[i], seq[j]) = (seq[j], seq[i]);
            }
        }

        games[player] = GameState({
            sequence: seq,
            attempts: 5,
            active: true,
            won: false,
            lastShuffle: block.timestamp
        });
    }

    function getGameState()
        external
        view
        returns (
            bool active,
            bool won,
            uint8 attemptsLeft,
            uint256 lastShuffleTime
        )
    {
        GameState storage game = games[msg.sender];
        return (game.active, game.won, game.attempts, game.lastShuffle);
    }

    // For development only - remove in production
    function _getSequence() external view returns (uint8[5] memory) {
        return games[msg.sender].sequence;
    }
}
