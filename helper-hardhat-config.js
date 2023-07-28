/*Network configuration is defined here so that based on the network and it's chainid the
respective ethusd price contract address is picked and used in the code. This elimates
hardcoding for datafeeds where we get ETHUSD price */
const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    //31337 hardhat chain id. What about this? Do we need to create above?
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8; //required to pass to mock interface from chainlink
const INITIAL_ANSWER = 200000000000; /*same as above. Also we want
initial answer as 2000 and since there are 8 decimals to the value those many
are added to 2000*/

//export the networkConfig so that other modules can use it
module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
};
