LESSON 7 from FreeCodeCamp 32hs course "Learn Blockchain, Solidity, and Full Stack Web3 Development with JavaScript – 32-Hour Course"

Step By Step:

1. yarn add --dev hardhat
2. yarn hardhat
3. Choose advanced project
4. Install dependecies? Y
5. We copy and paste contracts
6. yarn add --dev @chainlink/contracts. We added chainlink contracts.
7. yarn hardhat compile
8. yarn add --dev hardhat-deploy. Easier to deploy and test
9. we add require("hardhat-deploy"); to file hardhat.config.js
10. yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers. We overwrite hardhat-ethers and replace it with hardhat-deploy-ethers
11. We create "deploy" folder. This is where the deploy scripts are.
12. create file helper-hardhat-config.js
13. create test folder inside contracts folder to create mocks contracts

TESTING

yarn hardhat test --grep "Withdraw ETH", with grep you can filter and just test one particular thing

GAS USAGE

1. Variables in storage consume a lot of gas. Solution: store in memory
2. Visibility, change public for private or internal
3. Errors, change the require for revert
