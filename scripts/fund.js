const { deployments, ethers } = require("hardhat");

async function main() {
    const fundMeAddress = (await deployments.get("FundMe")).address;
    const fundMe = await ethers.getContractAt("FundMe", fundMeAddress);
    console.log("funding the contract...");
    const txResponse = await fundMe.fund({ value: ethers.parseEther("0.1") });
    await txResponse.wait(1);
    console.log("funded!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
