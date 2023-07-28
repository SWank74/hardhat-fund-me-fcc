// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;


//Get funds from users
//Withdraw funds
//Set min fund value in USD

import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


contract FundMe {

    //apend the variable names so that they indicate if doing opretions on them cost gas
    address private immutable i_ownerofContract; //i_ immutable as it's not storage variable
    address[] private s_funders; //definetely persisted and hence s_
    mapping(address => uint256) private s_fundersToAmountMap;
    AggregatorV3Interface private s_priceFeed;

    using PriceConverter for uint256;
    
    //error codes
    error FundMe__NotOwner();

    constructor (address priceFeedAdr) {
        i_ownerofContract = msg.sender;
        s_priceFeed =  AggregatorV3Interface(priceFeedAdr);
        //constructor is called as soon the contract is deployed.
    }

    receive() external payable {
        fund();
    }

    fallback() external  payable {
        fund();
    }

    function fund() public payable  {
        uint256 minFund = 50 * 1e18; //this multiplication is required as (msg.value) is in wei. So the converted value is USD will be 1e18 of ETH
        //if the contract is receiving / sending token then the function should be set to payable
        //"require" below is to check if the token that was send was of value more that the min set.
        //otherwise the function reverts with an error message. The user is refunded any unspent gas
        require(msg.value.convertToUSD(s_priceFeed) >= minFund, "Did not send enough");
        s_funders.push(msg.sender);
        s_fundersToAmountMap[msg.sender] = msg.value;
    }

    //Add modifier to the function to execute in whats in the the modifier first. Modifier is used if the same code is 
    //required in many places

    function withdraw() public payable onlyOwner {
        //check if the sender of withdraw tx is the owner who is authroized to withdraw the funds.
        
        for (uint256 index = 0; index < s_funders.length; index++) {
            
            //set the amounts for each funder address  to zero
            s_fundersToAmountMap[s_funders[index]] = 0;
        }
        //reset the funders array by allocating a new address array to it
        s_funders = new address[](0);

        //Withdraw methods. Preferred is call method as it forwards all gas or set gas. Transfer and Send have limit of 2300 gas
        /*payable (msg.sender).transfer(address(this).balance); //transfer method reverts the tx automatically in case of failure
        bool sendSuccess = payable (msg.sender).send(address(this).balance);
        require(sendSuccess, "Failed to send"); //require is put here to revert the tx if send did not succeed*/
        
        (bool callSuccess,)= payable (i_ownerofContract).call{value: address(this).balance}("");
        require(callSuccess,"Failed to call method to send"); //require is put here to revert the tx if call did not succeed

    }

    //Write the withdraw function that's gas efficient. Reading and writing of storage variables
    //takes a lot of gas. So operations on them must be optimized 

    function cheaperWithdraw() public payable onlyOwner {
        //read the entire funders array in storage at once in memory so that it costs only one read gas
        // In above withdraw function each element is read of the s_funders one by one in a 
        //loop and its costs gas for every read.
        address[] memory funders = s_funders; 
        
        for (uint256 index = 0; index < funders.length; index++) {
            
            //set the amounts for each funder address  to zero
            s_fundersToAmountMap[funders[index]] = 0;
        }
        //reset the funders array by allocating a new address array to it
        s_funders = new address[](0);
        
        (bool callSuccess,)= payable (i_ownerofContract).call{value: address(this).balance}("");
        require(callSuccess,"Failed to call method to send"); //require is put here to revert the tx if call did not succeed
    }

    modifier onlyOwner {
        //When EVM encounteres modifier with a function it check modifier. Here require is executed first.
        //_; tell EVM to execute rest of the stuff that follows in the function which has modifier applied. 
       // require(msg.sender == i_ownerofContract, "Sender is not authorized to withdraw funds.");
       if(msg.sender != i_ownerofContract) revert FundMe__NotOwner();
        _;
    }

    /*receive function is a special function. It is defined withtout function keyword. If someone were to send 
     money to the contract without calling fund() function then we will not have record of the address and the amount
     In such cases receive gets called automatically. So if the tx is sent to contract without message data then receive is
     called. If tx has data then fallback is called*/

    function getPriceFeed () public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getFunderBalance (address funder) public view returns (uint256) {
        return s_fundersToAmountMap[funder];
    }

}
