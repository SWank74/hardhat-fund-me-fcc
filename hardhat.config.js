require("@nomicfoundation/hardhat-toolbox"); //This is enough. hardhat-etherscan is not need
require("dotenv").config();
//require("./tasks/block-number");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */
const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL || "https://sepolia.etherscan.io/"; //this is done so that if actual url is not given then hardhat can report it properly
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || "key";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key";

module.exports = {
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [SEPOLIA_PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337, //same as hardhat.
            //no accounts is needed as hardhat adds from local node automatically
        },
    },
    //solidity: "0.8.8",
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },

    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },

    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
};
