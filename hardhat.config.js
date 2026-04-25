require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

// Only use PRIVATE_KEY if it looks like a valid 64-char hex key
const isValidPrivateKey = (key) =>
  key && /^(0x)?[0-9a-fA-F]{64}$/.test(key.trim());

module.exports = {
  solidity: "0.8.20",
  networks: {
    // Local Ganache network
    ganache: {
      url: process.env.INFURA_URL || "http://127.0.0.1:7545",
      accounts: isValidPrivateKey(process.env.PRIVATE_KEY)
        ? [process.env.PRIVATE_KEY.trim().startsWith("0x")
            ? process.env.PRIVATE_KEY.trim()
            : `0x${process.env.PRIVATE_KEY.trim()}`]
        : [],
    },
    // Hardhat local network (for testing without Ganache)
    hardhat: {
      chainId: 1337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
