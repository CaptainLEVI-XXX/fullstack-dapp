// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract ExchangeOffer {
    // Event emitted when a trade offer is created
    event OfferCreated(address indexed maker, address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB, uint index);

    // Event emitted when a trade offer is canceled
    event OfferCancelled(address indexed maker, uint indexed index);

    // Event emitted when a trade offer is filled
    event OfferFilled(address indexed maker,uint indexed index);

    // Event emitted when a trade offer is partially filled
    event PartialFill(address indexed trader, uint256 amountA, uint256 amountB, uint indexed index);

    // Struct to represent a trade offer
    struct TradeOfferStruct {
        address maker;
        address tokenA;
        address tokenB;
        uint256 amountA;
        uint256 amountB;
        bool filled;
    }

    TradeOfferStruct[] public tradeOffers;
    mapping(uint256 => bool) public tradeOfferIsCanceled;

    uint public offerId;
    uint256 public offerListingFees = 0.001 ether;
    address public immutable adminOfContract;

    constructor(address _admin) {
        adminOfContract = _admin;
    }

    receive() external payable {}

    /***
     * M O D I F I E R S
     ***/

    /**
     * @dev Modifier to allow only the admin of the contract to access certain functions.
     */
    modifier onlyAdmin() {
        require(msg.sender == adminOfContract, "Only Admin has rights");
        _;
    }
    /**
     * @dev Modifier to check if an address is not unknown (not equal to zero address).
     * @param caller The address to check.
     */

    modifier notUnknown(address caller) {
        require(caller != address(0), "Unknown address");
        _;
    }

    /**
     * @dev Modifier to check if a value is not zero.
     * @param amount The value to check.
     */

    modifier notZero(uint256 amount) {
        require(amount != 0, "Amount should be greater than 0");
        _;
    }

    /***
     * A D M I N  ACCESS FUNCTION
    ***/

    /**
     * @notice Changes the listing fees for the contract.
     * @param _newOfferListingFees The new listing fees to set.
     * @dev This function can only be called by the admin of the contract.
     */

    function changeListingFees(uint _newOfferListingFees) public onlyAdmin {
        offerListingFees = _newOfferListingFees;
    }

    /**
     * @notice Withdraws funds from the contract.
     * @param _amount The amount of funds to withdraw.
     * @param _to The address to which the funds will be transferred.
     * @dev This function can only be called by the admin of the contract.
     * @dev The amount to withdraw must not exceed the contract balance.
     */
    function withdrawFunds(uint256 _amount, address _to) public onlyAdmin notUnknown(_to) notZero(_amount) {
        require(_amount <= address(this).balance, "Not enough funds");
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Funds transfer failed");
    }


    /***
     * T R A D E   O F F E R   F U N C T I O N S
    ***/



    /**
     * @notice Creates a new trade offer.
     * @param tokenA The address of token A.
     * @param tokenB The address of token B.
     * @param amountA The amount of token A.
     * @param amountB The amount of token B.
     * @dev This function allows users to create a new trade offer by specifying token addresses and amounts.
     * @dev Users must pay a listing fee to create a trade offer.
     * @dev Token A and Token B cannot be the same.
     */
    function createTradeOffer(address tokenA, address tokenB, uint256 amountA, uint256 amountB) public payable notUnknown(tokenA) notZero(amountA) notUnknown(tokenB) notZero(amountB) {
        require(tokenA != tokenB, "Token A and Token B cannot be the same");
        require(msg.value >= offerListingFees, "Not enough fees paid");

        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);

        TradeOfferStruct memory tradeStructOffer = TradeOfferStruct({
            maker: msg.sender,
            tokenA: tokenA,
            tokenB: tokenB,
            amountA: amountA,
            amountB: amountB,
            filled: false
        });
        tradeOffers.push(tradeStructOffer);
        
        emit OfferCreated(msg.sender, tokenA, tokenB, amountA, amountB, offerId);
        offerId++;
    }

    /**
     * @notice Cancels a trade offer.
     * @param index The index of the trade offer to cancel.
     * @dev This function allows the maker of a trade offer to cancel it.
     * @dev The trade offer must not already be filled or canceled.
     * @dev The tokens reserved for the trade offer will be returned to the maker.
     */ 
    function cancelTradeOffer(uint index) public {
        require(index < tradeOffers.length, "Invalid index");
        require(!tradeOfferIsCanceled[index], "Already cancelled offer");

        TradeOfferStruct storage offer = tradeOffers[index];
        require(msg.sender == offer.maker, "Not the owner of trade offer");
        require(!offer.filled, "Offer already filled");

        IERC20(offer.tokenA).transfer(offer.maker, offer.amountA);
        tradeOfferIsCanceled[index] = true;

        emit OfferCancelled(offer.maker, index);
    }


    /**
     * @notice Fills a trade offer.
     * @param index The index of the trade offer to fill.
     * @param tokenB The address of token B to fill the offer with.
     * @param amountB The amount of token B to fill the offer with.
     * @dev This function allows users to fill a trade offer by providing token B and the desired amount.
     * @dev The amount of token A to be exchanged is calculated based on the offer ratio.
     * @dev Tokens are transferred between the taker and maker, and the trade offer is marked as filled if fully completed.
     */
    function fillTradeOffer(uint index, address tokenB, uint amountB) public notZero(amountB) {
        require(!tradeOfferIsCanceled[index], "This offer is canceled");

        TradeOfferStruct storage offer = tradeOffers[index];
        require(!offer.filled, "Offer already filled");
        require(offer.tokenB == tokenB, "Token mismatch");

        uint256 amountA = (amountB * offer.amountA) / offer.amountB;
        require(amountA > 0, "Invalid amountA calculation");

        // Transfer token B from taker to maker
        IERC20(tokenB).transferFrom(msg.sender, offer.maker, amountB);

        // Transfer token A from contract to taker
        IERC20(offer.tokenA).transfer(msg.sender, amountA);

        offer.amountA -= amountA;
        offer.amountB -= amountB;

        emit PartialFill(msg.sender, offer.amountA, offer.amountB, index);

        // Check if the offer is completely filled or if amountB is zero
        if (offer.amountA == 0 || offer.amountB == 0) {
            offer.filled = true;
            emit OfferFilled(offer.maker, index);
            // If amountB is zero, transfer the remaining amountA back to the maker
            if (offer.amountB == 0 && offer.amountA > 0) {
                IERC20(offer.tokenA).transfer(offer.maker, offer.amountA);
            }
        } 
    }
}