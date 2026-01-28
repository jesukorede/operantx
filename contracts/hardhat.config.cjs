require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

const PEAQ_RPC_URL = process.env.PEAQ_RPC_URL || "";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const CHAIN_ID = Number(process.env.CHAIN_ID || 0);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    peaq: {
      url: PEAQ_RPC_URL,
      chainId: CHAIN_ID || undefined,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
