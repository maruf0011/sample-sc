const Campaign = artifacts.require("./Campaign.sol");

contract("Campaign", (accounts) => {
  it("TEST campain deployment", async () => {
    const campaign = await Campaign.deployed("campaign");
    // console.log(campaign);
    assert.equal(1, 1, "error");
    // // Set value of Hello World
    // await helloBlockchainInstance.SendRequest("Hello Blockchain", {
    //   from: accounts[0],
    // });

    // // Get stored value
    // const storedData = await helloBlockchainInstance.RequestMessage.call();

    // assert.equal(
    //   storedData,
    //   "Hello Blockchain",
    //   "The value 'Hello Blockchain' was not stored."
    // );
  });
});
