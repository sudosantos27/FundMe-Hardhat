require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;  // we store the URL in a variable
// we need to write in the terminal: yarn add --dev dotenv, to pull info from .env

const PRIVATE_KEY = process.env.PRIVATE_KEY;  // this is from metamask account

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;  // import apikey from etherscan to verify

module.exports = {
  // solidity: "0.8.8", we have to use multiple compilers for different contracts
  solidity: {
    compilers: [
      {version: "0.8.8"},
      {version: "0.6.6"},
    ],
  },
  networks: {
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4,
      blockConfimations: 6,
    },
  },
  gasReporter: {    // gas reporter to see how much gas I use in each function: yarn add hardhat-gas-reporter --dev 
    enabled: false,
    outputFile: "gas-report.txt",  
    noColors: true,
    currency: "USD",  // to see gas prices in USD we need coinmarketcap API
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "MATIC"  // we can choose which blockchain we want to see
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
        1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
},
};
