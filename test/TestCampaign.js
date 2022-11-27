const Campaign = artifacts.require("./Campaign.sol");

contract("Test Campaign Contract", (accounts) => {
  it("TEST Owner", async () => {
    const campaign = await Campaign.deployed("campaign");
    const owner = await campaign.owner.call();

    assert.equal(accounts[0], owner, "Missing owner");
  });

  it("Test initial state", async () => {
    const campaign = await Campaign.deployed("campaign");
    const inital_campain_state = await campaign.camp_state.call();

    assert.equal(
      inital_campain_state,
      0,
      "Inital campain state should be closed."
    );
  });

  it("Test Campain state change", async () => {
    const campaign = await Campaign.deployed("campaign");
    for (let state = 1; state <= 2; state++) {
      await campaign.changeState(state);

      const campain_state = await campaign.camp_state.call();
      assert.equal(campain_state, state, "State change missmatch.");
    }
  });

  it("Test Campain contribution", async () => {
    const campaign = await Campaign.deployed("campaign");
    // open campaign
    await campaign.changeState(1);

    // contribute
    const contributor = accounts[1];

    await campaign.contribute({
      from: contributor,
      value: web3.utils.toWei("3", "ether"),
    });

    const contract_balance = await web3.eth.getBalance(campaign.address);
    assert.equal(
      contract_balance,
      web3.utils.toWei("3", "ether"),
      "balance missmatch"
    );

    const user_share = await campaign.usershare(accounts[1]);
    const possible_share =
      web3.utils.toWei("3", "ether") *
      web3.utils.toWei("1", "ether") *
      web3.utils.toBN("100000");

    assert.equal(user_share, possible_share, "user share missmatch");
  });
});
