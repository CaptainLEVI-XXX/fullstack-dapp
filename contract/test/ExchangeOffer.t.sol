// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {ExchangeOffer} from "../src/ExchangeOffer.sol";
import {IERC20} from "../src/utils/interfaces/IERC20.sol";
import {Token} from "../src/Token.sol";

contract ExchangeOfferTest is Test {
    ExchangeOffer public exchangeOffer;
    Token public tokenA;
    Token public tokenB;
    address public admin;
    address public userA;
    address public userB;

    struct TradeOfferStruct {
        address maker;
        address tokenA;
        address tokenB;
        uint256 amountA;
        uint256 amountB;
        bool filled;
    }

    function setUp() public {
        admin = address(this);
        userA = address(0x1);
        userB = address(0x2);

        tokenA = new Token("TokenA", "TA");
        tokenA.mint(userA, 10000);

        tokenB = new Token("TokenB", "TB");
        tokenB.mint(userB, 10000);

        exchangeOffer = new ExchangeOffer(admin);
    }

    function testCreateTradeOffer() public {
        uint256 _amountA = 100;
        uint256 _amountB = 200;

        vm.startPrank(userA);
        deal(userA, 5 ether);
        tokenA.approve(address(exchangeOffer), _amountA);

        exchangeOffer.createTradeOffer{value: 0.001 ether}(address(tokenA), address(tokenB), _amountA, _amountB);
        vm.stopPrank();

        (
            address maker,
            address tokenAAddr,
            address tokenBAddr,
            uint256 amountA,
            uint256 amountB,
            bool filled
        ) = exchangeOffer.tradeOffers(0);

        assertEq(maker, userA, "UserA address is incorrect");
        assertEq(tokenAAddr, address(tokenA), "Token A address is incorrect");
        assertEq(tokenBAddr, address(tokenB), "Token B address is incorrect");
        assertEq(amountA, _amountA, "Amount A is incorrect");
        assertEq(amountB, _amountB, "Amount B is incorrect");
        assertEq(filled, false, "Offer should not be filled");
    }

    function testCancelTradeOffer() public {
        uint256 _amountA = 100;
        uint256 _amountB = 200;

        vm.startPrank(userA);
        deal(userA, 5 ether);
        tokenA.approve(address(exchangeOffer), _amountA);
        exchangeOffer.createTradeOffer{value: 0.001 ether}(address(tokenA), address(tokenB), _amountA, _amountB);
        vm.stopPrank();

        vm.startPrank(userA);
        exchangeOffer.cancelTradeOffer(0);
        vm.stopPrank();

        assertTrue(exchangeOffer.tradeOfferIsCanceled(0), "Offer should be cancelled");
    }

    function testFillTradeOffer() public {
        uint256 _amountA = 100;
        uint256 _amountB = 200;

        vm.startPrank(userA);
        deal(userA, 5 ether);
        tokenA.approve(address(exchangeOffer), _amountA);
        exchangeOffer.createTradeOffer{value: 0.001 ether}(address(tokenA), address(tokenB), _amountA, _amountB);
        vm.stopPrank();

        vm.startPrank(userB);
        deal(userB, 5 ether);
        tokenB.approve(address(exchangeOffer), _amountB);
        exchangeOffer.fillTradeOffer(0, address(tokenB), _amountB);
        vm.stopPrank();

         (  ,
            ,
            ,
            uint256 amountA,
            uint256 amountB,
            bool filled
        ) = exchangeOffer.tradeOffers(0);
        assertEq(amountA, 0, "Amount A should be zero after filling");
        assertEq(amountB, 0, "Amount B should be zero after filling");
        assertTrue(filled, "Offer should be marked as filled");

        assertEq(tokenA.balanceOf(userB), _amountA, "UserB should have received amountA");
        assertEq(tokenB.balanceOf(userA), _amountB, "UserA should have received amountB");
    }
}
