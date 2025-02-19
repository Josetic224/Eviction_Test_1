import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
// import dotenv from "dotenv";
// dotenv.config();

const PRIVATE_KEY = vars.get("PRIVATE_KEY");
const PRIVATE_KEY1 = vars.get("PRIVATE_KEY1");
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
const ARBITRUM_API_KEY = vars.get("ARBITRUM_API_KEY");

// if (!PRIVATE_KEY) {
//   throw new Error("PRIVATE_KEY is not defined in the .env file");
// }

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  defaultNetwork: "base_sepolia", // ✅ Fixed default network
  networks: {
    base_sepolia: {
      url: "https://sepolia.base.org",
      accounts: [PRIVATE_KEY],
    },
    lisk_sepolia: {
      url: "https://rpc.sepolia-api.lisk.com", // Updated to Lisk Sepolia
      accounts: [PRIVATE_KEY, PRIVATE_KEY1], // Added safety check
    },
  },
  etherscan: {
    apiKey: {
      lisk_sepolia: "123",
      base_sepolia: ETHERSCAN_API_KEY,
      arbitrum_sepolia: ARBITRUM_API_KEY,
    },
    customChains: [
      // ✅ Required for Base Sepolia verification
      {
        network: "base_sepolia",
        chainId: 84532, // Base Sepolia Chain ID
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "lisk_sepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com",
        },
      },
      {
        network: "arbitrum_sepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://api-sepolia.arbiscan.io",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
