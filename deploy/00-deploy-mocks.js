// when we want to test on local network, price feed contracts do not exist
// So we have to create a minimal version of it for local testing

const { network } = require("hardhat");
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config");

module.exports = async({getNamedAccounts, deployments}) => {
    const { deploy, log } = deployments;            // we pull out the 2 functions from hre.deployments 
    const { deployer } = await getNamedAccounts();   // with this function we get accounts
    const chainId = network.config.chainId;

    // if chainId X, use address Y
    if(chainId == 31337) {
        log("Local network detected! Deploying mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],    // parameters for constructor of contract MockV3Aggregator
            log: true
        })
        log("Mocks deployed!");
        log("--------------------------------------");
    }

    /*
    The array includes() is a built-in JavaScript method that defines whether the array contains the specified element or not. 
    The includes() function accepts element and start parameters and returns true or false as output depending on the result.
    The includes() method is case sensitive.
    */
    
}

module.exports.tags = ["all", "mocks"];

// this are flags. We can do "yarn hardhat deploy --tags mocks" to deploy mocks