const { deployments, ethers, network, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe;
          let deployer;
          const SEND_VALUE = ethers.parseEther("0.037");

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              const fundMeAddress = (await deployments.get("FundMe")).address;
              fundMe = await ethers.getContractAt("FundMe", fundMeAddress);
          });

          it("allows people to fund and owner to withdraw", async function () {
              await fundMe.fund({ value: SEND_VALUE });
              await fundMe.withdraw();
              const endingBalance = await ethers.provider.getBalance(
                  await fundMe.getAddress()
              );
              assert.equal(endingBalance, 0);
          });
      });
