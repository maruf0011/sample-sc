const Campaign = artifacts.require("./Campaign.sol");

contract("Test Campaign Contract", (accounts) => {
  let campaign;
  before(async () => {
    campaign = await Campaign.deployed("campaign");
  });
  it("TEST Owner", async () => {
    const owner = await campaign.owner.call();
    assert.equal(accounts[0], owner, "Missing owner");
  });

  it("Test initial state", async () => {
    const inital_campain_state = await campaign.camp_state.call();

    assert.equal(
      inital_campain_state,
      0,
      "Inital campain state should be closed."
    );
  });

  it("Test Campain state change", async () => {
    for (let state = 1; state <= 2; state++) {
      await campaign.changeState(state);

      const campain_state = await campaign.camp_state.call();
      assert.equal(campain_state, state, "State change missmatch.");
    }
    // reset state to zero
    await campaign.changeState(0);
  });

  it("Test Campain contribution", async () => {
    // const campaign = await Campaign.deployed("campaign");
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

  it("Test Open Campain withdrawal", async () => {
    // contribute
    const contributor = accounts[1];
    try {
      await campaign.withdraw({ from: accounts[0] });
    } catch (error) {
      assert.equal(
        error.reason,
        "Campaign is not closed.",
        "Campaign state should be closed."
      );
    }
  });
  it("Test Close Campain withdrawal without admin account", async () => {
    // contribute
    await campaign.changeState(0);
    try {
      await campaign.withdraw({ from: accounts[1] });
    } catch (error) {
      assert.equal(error.reason, "Not owner", "Only owner can withdraw.");
    }
  });
  it("Test Close Campain withdrawal", async () => {
    // contribute
    await campaign.withdraw({ from: accounts[0] });
    const contract_balance = await web3.eth.getBalance(campaign.address);
    assert.equal(
      contract_balance,
      web3.utils.toWei("0", "ether"),
      "contract balance should be zero."
    );
  });
});
