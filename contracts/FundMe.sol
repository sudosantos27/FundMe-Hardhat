/* Solidity Style Guide:
    1. PRAGMA
    2. Imports
    3. Errors
    4. Interfaces
    5. Libraries
    6. Contracts
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner(); // error should be named: "contractName"__"errorName", so it's easier to understand

/** @title  A contract for crowd funding
 *   @author Agustin Santos
 *   @notice This contract is to demo a sample funding contracts.    This is some kind of notes about the contract
 *   @dev    This implements price feeds as our library.             Notes for developers
 */

/** This is NatSpec, is a way of documenting code. With this, you can then generate documentation with commands.
 *   Read Docs: https://docs.soliditylang.org/en/develop/natspec-format.html
 */

contract FundMe {
    /* Solidity Style Guide for contracts:
    1. Type Declarataions
    2. State Variables
    3. Events
    4. Modifiers
    5. Functions
    */

    using PriceConverter for uint256;

    mapping(address => uint256) private s_addressToAmountFunded; // s_ means that is stored in storage
    address[] private s_funders;

    address private immutable i_owner; // i_ means that is immutable
    uint256 public constant MINIMUM_USD = 50 * 10**18;

    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    /**    Functions Order:
     *
     *       1. Constructor
     *       2. Receive
     *       3. Fallback
     *       4. External
     *       5. Public
     *       6. Internal
     *       7. Private
     *       8. View / Pure
     */

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**     A fallback function is a function within a smart contract that is
     *      called if no other function in the contract matches the specified function in the call.
     *
     *      The receive() method is used as a fallback function if Ether are sent to the contract and
     *      no calldata are provided (no function is specified). It can take any value. If the
     *      receive() function doesn’t exist, the fallback() method is used.
     *
     *      The fallback() function is used if a smart contract is called and no other function
     *      matches (not even the receive() function). It works, if calldata are included. But it is optionally payable.
     */

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \
    //         yes  no
    //         /     \
    //    receive()?  fallback()
    //     /   \
    //   yes   no
    //  /        \
    //receive()  fallback()

    /**
     *   @notice This function funds this contract
     */

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders; // we store the array in memory so it's cheaper when we read it
        // mappings can not be in memory

        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
