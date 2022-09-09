/** Unit tests: 
 *  Is for testing small units of contract, like each function separately.
 */

const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)   // we run this if we are in a development chain
    ? describe.skip :  
    describe("FundMe", async function(){

        let fundMe;
        let deployer;
        let mockV3Aggregator;
        const sendValue = ethers.utils.parseEther("1");     // converts the 1 to 1000000000000000000 (18 zeros)
        
        beforeEach(async function(){
            // deploy our FundMe contract using Hardhat-deploy

            // another way to get accounts from hardhat config
            // const accounts = await ethers.getSigners();     // getSigners returns whatever it is in accounts section in networks
            // const accountZero = accounts[0];

            // const { deployer } = await getNamedAccounts();      // we get just the deployer from "getNamedAccounts"
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]);     // with this line we deploy all contracts, we run all deploy scripts.
            fundMe = await ethers.getContract("FundMe", deployer);  // we get latest FundMe contract and connect deployer to fundMe variable
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
        })

        describe("constructor", async function(){
            it("sets the aggregator addresses correctly", async function(){
                const response = await fundMe.getPriceFeed();
                assert.equal(response, mockV3Aggregator.address);       // checks that response is the same as mockV3Aggregator.address
            })
        })

        describe("fund", async function(){
            it("Fails if you not send enough ETH", async function(){
                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!"); 
                // expects the function to be reverted with that error message
            })

            it("Updated the amount funded data structure", async function(){
                await fundMe.fund({value: sendValue});
                const response = await fundMe.getAddressToAmountFunded(deployer);
                assert.equal(response.toString(), sendValue.toString());    
                // we check that the value is stored on mapping
            })

            it("Adds funder to array of getFunder", async function(){
                await fundMe.fund({value: sendValue});
                const funder = await fundMe.getFunder(0);
                assert.equal(funder, deployer);
                // checks that the funder is the same as deployer and added to array
            })
        })

        describe("withdraw", async function(){
            beforeEach(async function(){
                await fundMe.fund({ value: sendValue }); 
            })// automatically funds the contract before each test, so we have something to withdraw

            it("Withdraw ETH from a single funder", async function() {
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);
                
                const transactionResponse = await fundMe.withdraw();
                const transactionReceipt = await transactionResponse.wait(1);
                const { gasUsed, effectiveGasPrice } = transactionReceipt;
                const gasCost = gasUsed.mul(effectiveGasPrice);     // we multiply these 2 big numbers

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

                assert.equal(endingFundMeBalance, 0);
                assert.equal(
                    startingDeployerBalance.add(startingFundMeBalance), 
                    endingDeployerBalance.add(gasCost).toString());
            })

            it("Allows us to withdraw with multiple getFunder", async function(){
                const accounts = await ethers.getSigners();     // we get the accounts so we can loop through them
                
                // i = 1 because i = 0 is the deployer
                for(i = 1; i < 6; i++){
                    const fundMeConnectedContract = await fundMe.connect(accounts[i]);     // now fundMeConnectedContract is each account
                    
                    await fundMeConnectedContract.fund({ value: sendValue });   // we fund contract with each account
                }
                    
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

                const transactionResponse = await fundMe.withdraw();
                const transactionReceipt = await transactionResponse.wait(1);
                const { gasUsed, effectiveGasPrice } = transactionReceipt;
                const gasCost = gasUsed.mul(effectiveGasPrice);  

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

                assert.equal(endingFundMeBalance, 0);
                assert.equal(
                    startingDeployerBalance.add(startingFundMeBalance), 
                    endingDeployerBalance.add(gasCost).toString());

                await expect(fundMe.getFunder(0)).to.be.reverted;     // make sure that the getFunder array is reset properly

                for(i = i; i < 6; i++){
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i]), 0);   // check yhat mapping gets reseted
                }

                
            })

            it("Only allows the owner to withdraw", async function(){
                const accounts = await ethers.getSigners();     // we get the accounts
                const attacker = accounts[1];                   // we set an account that is not the deployer (owner)
                const attackerConnectedContract = await fundMe.connect(attacker);   // we connect the attacker account to contract
                await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner");  // we expect that the withdraw gets reverted
            })

            it("cheaperWithdraw testing...", async function(){
                const accounts = await ethers.getSigners();     // we get the accounts so we can loop through them
                
                // i = 1 because i = 0 is the deployer
                for(i = 1; i < 6; i++){
                    const fundMeConnectedContract = await fundMe.connect(accounts[i]);     // now fundMeConnectedContract is each account
                    
                    await fundMeConnectedContract.fund({ value: sendValue });   // we fund contract with each account
                }
                    
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

                const transactionResponse = await fundMe.cheaperWithdraw();
                const transactionReceipt = await transactionResponse.wait(1);
                const { gasUsed, effectiveGasPrice } = transactionReceipt;
                const gasCost = gasUsed.mul(effectiveGasPrice);  

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

                assert.equal(endingFundMeBalance, 0);
                assert.equal(
                    startingDeployerBalance.add(startingFundMeBalance), 
                    endingDeployerBalance.add(gasCost).toString());

                await expect(fundMe.getFunder(0)).to.be.reverted;     // make sure that the getFunder array is reset properly

                for(i = i; i < 6; i++){
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i]), 0);   // check yhat mapping gets reseted
                }

                
            })
        })
    })