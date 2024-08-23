require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  etherscan: {
    customChains: [
      {
        network: "scrollSepolia",
        chainId: 534351,
        urls: {
          apiURL: "https://api-sepolia.scrollscan.com/api", // Replace with the actual API URL for verification
          browserURL: "https://sepolia.scrollscan.com/'",
        },
      },
    ],
    apiKey: {
      scrollSepolia: process.env.SCROLL_API_KEY,
    },
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.API_KEY,
      accounts: [
        process.env.PRIVATE_KEY,
        process.env.PRIVATE_KEY2,
        process.env.PRIVATE_KEY3,
        process.env.PRIVATE_KEY4,
        process.env.PRIVATE_KEY5,
      ],
      chainId: 11155111,
    },
    scrollSepolia: {
      url: "https://sepolia-rpc.scroll.io/",
      accounts: [
        process.env.PRIVATE_KEY,
        process.env.PRIVATE_KEY2,
        process.env.PRIVATE_KEY3,
        process.env.PRIVATE_KEY4,
        process.env.PRIVATE_KEY5,
      ],
      timeout: 200000,
    },
  },
};
