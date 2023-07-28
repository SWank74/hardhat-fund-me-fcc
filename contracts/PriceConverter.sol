// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
 function getEthUSDPrice (AggregatorV3Interface priceFeed) internal view returns (uint256) {
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return uint256(answer*1e10);
    }

    function convertToUSD (uint256 ethSent, AggregatorV3Interface priceFeed) internal view returns(uint256) {
        uint256 ethPrice = getEthUSDPrice(priceFeed);
        uint256 ethInUSD = (ethPrice * ethSent) / 1e18;
        return ethInUSD;
    }


}
