# Exchange Offer Smart Contract

This repository contains the implementation and testing of an Exchange Offer smart contract. The smart contract facilitates creating, filling, and canceling trade offers between two ERC-20 tokens.

## Overview

The Exchange Offer smart contract allows users to create trade offers for swapping one ERC-20 token for another. Users can specify the token pair and the amount they wish to trade. Other users can then fill these offers by providing the requested tokens.

## Smart Contract

### ExchangeOffer.sol

The `ExchangeOffer` smart contract provides the following functionalities:

- **Create Trade Offer**: Users can create a trade offer by specifying the tokens and amounts they wish to trade. A listing fee is required to create an offer.
- **Cancel Trade Offer**: The maker of a trade offer can cancel it, reclaiming the tokens they offered.
- **Fill Trade Offer**: Other users can fill a trade offer by providing the requested tokens, completing the trade.

### Key Functions

- `createTradeOffer(address tokenA, address tokenB, uint256 amountA, uint256 amountB)`
- `cancelTradeOffer(uint index)`
- `fillTradeOffer(uint index, address tokenB, uint amountB)`
- `withdrawFunds(uint256 _amount, address _to)`

### Events

- `OfferCreated(address indexed maker, address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB, uint index)`
- `OfferCancelled(address indexed maker, uint indexed index)`
- `OfferFilled(address indexed maker, uint indexed index)`
- `PartialFill(address indexed trader, uint256 amountA, uint256 amountB, uint indexed index)`

## Testing

### ExchangeOfferTest.sol

The test file `ExchangeOfferTest.sol` contains unit tests for the `ExchangeOffer` smart contract using the Foundry framework. The tests ensure that the contract functions as expected, covering scenarios for creating, canceling, and filling trade offers.

## Setup and Installation

### Prerequisites

- [Foundry](https://getfoundry.sh/) - Ethereum testing framework

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/CaptainLEVI-XXX/fullstack-dapp.git
    cd contract/
    ```

2. Install dependencies:
    ```sh
    forge install
    ```

## Usage

### Running Tests

To run the tests, execute the following command:

```sh
forge test
