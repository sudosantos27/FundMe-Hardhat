// function deployFunc(){}

// module.exports.default = deployFunc();

// module.exports = async(hre) => {
//     const {getNamedAccounts, deployments} = hre     // we pull the 2 variables from hre. Same as "hre.getNamedAccounts"
// }

// we will do it another way
const { network, getNamedAccounts, deployments } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// another way of importing this is:
/*
const helperConfig = require("../helper-hardhat-config");   helperConfig is the whole file
const networkConfig  = helperConfig.networkConfig;          networkConfig is the variable
*/

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments // we pull out the 2 functions from hre.deployments
    const { deployer } = await getNamedAccounts() // with this function we get accounts
    const chainId = network.config.chainId

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    // now when we do "yarn hardhat deploy --network rinkeby" , it will take rinkeby priceFeed

    let ethUsdPriceFeedAddress

    // if chainId X, use address Y
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, ethUsdPriceFeedAddress)
    }
    log("-------------------------------------")
}

module.exports.tags = ["all", "fundme"]
