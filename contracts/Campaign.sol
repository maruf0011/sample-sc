// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    address public owner;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        owner = msg.sender;
    }

    function mint(address payable to, uint256 amount) public payable {
        _mint(to, amount * 10**uint256(decimals()));
    }

    function burn(address payable from, uint256 amount) public payable {
        _burn(from, amount);
    }
}

contract Campaign {
    // memory
    address public owner;
    uint256 public constant TOKEN_PER_ETH = 100_000;

    enum State {
        CLOSED,
        OPEN,
        REFUNDING
    }

    State public camp_state;

    MyToken public token;

    // events
    event EVLog(uint256 timestamp, string msg);
    event EVRefund(uint256 balance, string msg);
    event EVWithdraw(uint256 balance);

    // modifiers

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier isCampaignOpen() {
        require(camp_state == State.OPEN, "Campaign is not Open.");
        _;
    }

    modifier isCampaignClosed() {
        require(camp_state == State.CLOSED, "Campaign is not closed.");
        _;
    }

    modifier isCampaignRefunding() {
        require(camp_state == State.REFUNDING, "Campaign is not refunding.");
        _;
    }

    // errors
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    constructor(string memory name) {
        owner = msg.sender;
        token = new MyToken(name, "mytoken");
    }

    // eth receiver
    receive() external payable {
        emit EVLog(block.timestamp, "Contribution received");
    }

    // contribute to the campaign
    function contribute() public payable isCampaignOpen {
        (bool sent, ) = address(this).call{value: msg.value}("");
        if (sent) {
            token.mint(payable(msg.sender), msg.value * TOKEN_PER_ETH);
        } else {
            revert("Contribution failed.");
        }
    }

    // get refund from the campain
    function refund(uint256 amount) public payable isCampaignRefunding {
        if (usershare(msg.sender) < amount) {
            revert InsufficientBalance({
                balance: usershare(msg.sender),
                withdrawAmount: amount
            });
        }

        token.burn(payable(msg.sender), amount);

        // return the eth
        uint256 eth_amount = amount / (TOKEN_PER_ETH * 10**token.decimals());

        emit EVRefund(eth_amount, "Starting to refund");
        (bool sent, bytes memory data) = msg.sender.call{value: eth_amount}("");

        if (sent) {
            emit EVRefund(eth_amount, "Refund successfull");
        } else {
            emit EVRefund(0, string(data));
            revert("Not enough eth in fund to refund");
        }
    }

    // withdraw eth from campain to campaign owner account
    function withdraw() public payable onlyOwner isCampaignClosed {
        uint256 withdraw_amount = address(this).balance;
        (bool sent, ) = owner.call{value: withdraw_amount}("");
        if (sent) {
            emit EVWithdraw(withdraw_amount);
        } else {
            revert("Failed to withdraw ETH");
        }
    }

    // change the staet of the campain
    function changeState(State new_state) public onlyOwner {
        require(camp_state != new_state, "Already in similar state.");

        camp_state = new_state;
    }

    // renounce the ownership
    function renounce() public onlyOwner isCampaignClosed {
        owner = address(0);
    }

    // utitlty function
    function usershare(address account) public view returns (uint256) {
        return token.balanceOf(account);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
