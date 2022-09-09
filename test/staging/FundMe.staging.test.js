// in this test we assume that the contract is already deployed on a testnet

const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai")

// let var = false
// let someVar = var ? "yes" : "no"

// is the same as:
// if (var) {someVar = "yes"} else {someVar = "no"}
developmentChains.includes(network.name) 
    ? describe.skip :                               // describe.skip just skips the describe
    describe("FundMe", async function() {
        let fundMe;
        let deployer;
        const sendValue = ethers.utils.parseEther("1");

        beforeEach(async function() {
            deployer = (await getNamedAccounts()).deployer;
            fundMe = await ethers.getContract("FundMe", deployer);
        })

        it("allows people to fund and withdraw", async function(){
            await fundMe.fund({ value: sendValue });
            await fundMe.withdraw();
            const endingBalance = await fundMe.provider.getBalance(fundMe.address);
            assert.equal(endingBalance.toString(), "0");
        })
    }) 
// we will run this if we are not in a development chain (which are hardhat and localhost)


