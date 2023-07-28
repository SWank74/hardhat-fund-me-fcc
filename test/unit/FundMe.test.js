const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe, deployer, mockV3AggregatorAddress;
          const SEND_VALUE = ethers.parseEther("1");

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]); //deploy contracts

              //Get the deployment corresponding to FundMe and then get
              //the address at which the contract is deployed
              const fundMeAtAddress = (await deployments.get("FundMe")).address;

              //Get the contract
              fundMe = await ethers.getContractAt("FundMe", fundMeAtAddress);
          });

          describe("constructor", async function () {
              //test for constructor
              it("sets the aggregator address correctly", async function () {
                  //Call a function from contract to get the pricefeed
                  //Note: priceFeed is a private storage in the contract and
                  //a get function is created to return it to the caller
                  const response = await fundMe.getPriceFeed();

                  mockV3AggregatorAddress = (
                      await deployments.get("MockV3Aggregator")
                  ).address;
                  assert.equal(response, mockV3AggregatorAddress);
              });
          });

          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async function () {
                  //use waffle for testing
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Did not send enough"
                  );
              });

              it("updates the amount in the funded data structure", async function () {
                  await fundMe.fund({ value: SEND_VALUE });
                  const response = await fundMe.getFunderBalance(deployer);
                  assert.equal(response.toString(), SEND_VALUE.toString());
              });

              it("adds funders to funder array", async function () {
                  await fundMe.fund({ value: SEND_VALUE });
                  const response = await fundMe.getFunder(0);
                  assert.equal(response, deployer);
              });
          });

          describe("withdraw", async function () {
              beforeEach(async function () {
                  //make sure that the contract has a balance so that
                  //we can test withdraw functionality
                  await fundMe.fund({ value: SEND_VALUE });
              });

              it("withdraw ETH to deployer", async function () {
                  //get the initial balances
                  const intialContractBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress()
                      );
                  const initialDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  //withdraw the funds
                  const txResponse = await fundMe.withdraw();
                  const txReceipt = await txResponse.wait(1);

                  //get the final balances
                  const finalContractBalance = await ethers.provider.getBalance(
                      await fundMe.getAddress()
                  );
                  const finalDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  );

                  assert.equal(finalContractBalance, 0);
                  assert.equal(
                      finalDeployerBalance + txReceipt.fee,
                      initialDeployerBalance + intialContractBalance
                  );
              });

              it("withdraw from multiple funders", async function () {
                  //get multiple accounts
                  const accounts = await ethers.getSigners();

                  //1st account at 0th position is the deployer. Hence use the accounts starting from 2
                  for (let i = 1; i < 6; i++) {
                      const connectedFundMeContract = await fundMe.connect(
                          accounts[i]
                      );
                      await connectedFundMeContract.fund({ value: SEND_VALUE });
                  }
                  //get the initial balances
                  const intialContractBalance =
                      await fundMe.runner.provider.getBalance(
                          await fundMe.getAddress()
                      );
                  const initialDeployerBalance =
                      await fundMe.runner.provider.getBalance(deployer);

                  //withdraw the funds
                  const txResponse = await fundMe.withdraw();
                  const txReceipt = await txResponse.wait(1);

                  //get the final balances
                  const finalContractBalance = await ethers.provider.getBalance(
                      await fundMe.getAddress()
                  );
                  const finalDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  );

                  //check if balances are transferred correctly
                  assert.equal(finalContractBalance, 0);
                  assert.equal(
                      finalDeployerBalance + txReceipt.fee,
                      initialDeployerBalance + intialContractBalance
                  );

                  //verify if funders array is reset
                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  //verify if the balances of all accounts who funded is zero
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getFunderBalance(accounts[i].address),
                          0
                      );
                  }
              });

              it("only owner can withdraw", async function () {
                  accounts = await ethers.getSigners();
                  attacker = accounts[1];

                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
              });
          });

          describe("cheaper withdraw", async function () {
              beforeEach(async function () {
                  //make sure that the contract has a balance so that
                  //we can test withdraw functionality
                  await fundMe.fund({ value: SEND_VALUE });
              });

              it("withdraw ETH to deployer", async function () {
                  //get the initial balances
                  const intialContractBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress()
                      );
                  const initialDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  //withdraw the funds
                  const txResponse = await fundMe.cheaperWithdraw();
                  const txReceipt = await txResponse.wait(1);

                  //get the final balances
                  const finalContractBalance = await ethers.provider.getBalance(
                      await fundMe.getAddress()
                  );
                  const finalDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  );

                  assert.equal(finalContractBalance, 0);
                  assert.equal(
                      finalDeployerBalance + txReceipt.fee,
                      initialDeployerBalance + intialContractBalance
                  );
              });

              it("withdraw from multiple funders", async function () {
                  //get multiple accounts
                  const accounts = await ethers.getSigners();

                  //1st account at 0th position is the deployer. Hence use the accounts starting from 2
                  for (let i = 1; i < 6; i++) {
                      const connectedFundMeContract = await fundMe.connect(
                          accounts[i]
                      );
                      await connectedFundMeContract.fund({ value: SEND_VALUE });
                  }
                  //get the initial balances
                  const intialContractBalance =
                      await fundMe.runner.provider.getBalance(
                          await fundMe.getAddress()
                      );
                  const initialDeployerBalance =
                      await fundMe.runner.provider.getBalance(deployer);

                  //withdraw the funds
                  const txResponse = await fundMe.cheaperWithdraw();
                  const txReceipt = await txResponse.wait(1);

                  //get the final balances
                  const finalContractBalance = await ethers.provider.getBalance(
                      await fundMe.getAddress()
                  );
                  const finalDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  );

                  //check if balances are transferred correctly
                  assert.equal(finalContractBalance, 0);
                  assert.equal(
                      finalDeployerBalance + txReceipt.fee,
                      initialDeployerBalance + intialContractBalance
                  );

                  //verify if funders array is reset
                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  //verify if the balances of all accounts who funded is zero
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getFunderBalance(accounts[i].address),
                          0
                      );
                  }
              });

              it("only owner can withdraw", async function () {
                  accounts = await ethers.getSigners();
                  attacker = accounts[1];

                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.cheaperWithdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
              });
          });
      });
