const { network } = require("hardhat");
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config");

//getNamedAccounts get the account from which the contract
//will be deployed. For this you MUST have nameAccounts json
//in hardhat.config file otherwise deploy will fail
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    //deploy a mock contract only if the chainId belongs to
    if (developmentChains.includes(network.name)) {
        log("Local network detected. Deploying mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });

        log("Mocks deployed...");
        log("----------------------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
