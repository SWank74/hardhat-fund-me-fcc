const { developmentChains } = require("../helper-hardhat-config");
/*networkConfig below is put in curly braces, thats the shortcut to extract it instead
of doing:
const helperConfig = require("../helper-hardhat-config") 
const networkConfig = helpConfig.networkConfig;
*/
const { networkConfig } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

/* one way of writing deploy scripts
async function deployfunc (hre) {
    //hardhat run time env is passed to this function and following parameters
    //are extracted
    const namedAccounts = hre.getNamedAccounts();
    const deployments = hre.deployments;
}

module.exports.default = deployfunc; */

/* Another way of doing above using anonymous function is
module.exports = async (hre) => {
    const {getNamedAccounts, deployments} =hre;
} */

//Generally following is used as its more compact
//When deploy is executed on terminal this number file is called and all
//the numbered files are called one by one to deploy the contract
//Depends on how the deploy task is executed
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    console.log("Chain id of network is :", chainId);

    //Get the pricefeed address
    let ethUsdPriceFeedAddress;
    //if the contract is being deployed on development chain
    //then get the address of the mock price feed
    if (developmentChains.includes(network.name)) {
        //get the mock contract that was deployed
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
        console.log("Feed address is :", ethUsdPriceFeedAddress);
    }

    const args = [ethUsdPriceFeedAddress];
    //deploy a mock if the contract is deploy on local chain hardhat for quick testing
    //as deploying on test network takes lot of time and can slow down progress
    //deploy mock is deploying a mock contract

    /*use deploy function extracted from hre to deploy the contract as below
    args are the arguments to be passed to the constructor of the contract
    log is to do custom log so that we don't have to do console.log for debugging etc.*/
        const fundMe = await deploy("FundMe", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1,
        });

    //Verify the contract after deploying only when contract is deployed
    // on test net. For local deployments verification is meaningless
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args);
    }

    log("--------------------------------------------------------------");
};
module.exports.tags = ["all", "fundme"];
