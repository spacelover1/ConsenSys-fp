//SPDX-License-Identifier: MIT

pragma solidity >=0.5.16 <0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

///@title MarketPlace DApp
///@author Zeinab-Salimi
///@notice Simple Market Place for Consensys 2020 Bootcamp Final Project

contract MarketPlace is Ownable {
    //Uses SafeMath library to avoid integer overflow/underflow attacks
    using SafeMath for uint256;

    uint256 public storeOwnersCount;
    uint256 public adminCount;
    uint256 public storeCount;
    uint256 public productCount;
    bool public marktState;
    mapping(address => bool) public admins;
    mapping(address => bool) public storeOwners;
    mapping(uint256 => StoreFront) public storeFronts;
    mapping(address => uint256[]) public storeOwnertoStoreFront;
    mapping(uint256 => address) public storeFronttoStoreOwner;
    mapping(uint256 => Product) public StoreProducts;
    mapping(uint256 => uint256[]) public stotrFronttoProducts;

    struct StoreFront {
        string storeName;
        address storeOwner;
        address approverAdmin;
        uint256 skuCount;
        uint256 balance;
    }

    struct Product {
        string name;
        uint256 storeNum;
        uint256 productNum;
        uint256 price;
        uint256 quantity;
        bool isAvailable;
    }

    enum addressTypes {admin, storeOwner, shopper}

    event marketStateChanged(bool state);
    event storeOwnerAdded(address newStoreOwner);
    event storeFrontCreated(
        uint256 storeNum,
        string storeName,
        address storeOwner
    );
    event productAdded(
        uint256 storeNum,
        string productName,
        uint256 productNum
    );
    event productPriceUpdated(uint256 storeNum, uint256 productNum);
    event productRemoved(uint256 storeNum, uint256 productNum);
    event storeWithdrawn(uint256 amount, uint256 storeNum, address storeOwner);
    event productPurchased(
        uint256 storeNum,
        uint256 productNum,
        uint256 quantity,
        address shopper
    );

    /** @dev verifies the msg.sender is an admin */
    modifier onlyAdmin() {
        require(admins[msg.sender], "Sorry, you are not admin!");
        _;
    }

    /** @dev verifies the msg.sender is the store owner */
    modifier onlyStoreOwner() {
        require(storeOwners[msg.sender], "Sorry, you are not a store owner!");
        _;
    }

    /** @dev verifies the msg.sender is not a store owner or admin */
    modifier onlyShopper() {
        require(
            !storeOwners[msg.sender],
            "Sorry, store owner is not allowed to buy products!"
        );
        require(
            !admins[msg.sender],
            "Sorry, admin is not allowed to buy products!"
        );
        _;
    }

    /** @dev verifies market state */
    modifier isMarketActive() {
        require(marktState, "Sorry, Market state is inactive!");
        _;
    }

    /** @dev verifies the msg.sender is the store owner of the store front */
    modifier verifyStoreOwner(uint256 storeNum) {
        require(
            storeFronttoStoreOwner[storeNum] == msg.sender,
            "Sorry, you are not a store owner!"
        );
        _;
    }

    /** @dev constracter initalises state variables */
    constructor() public {
        admins[msg.sender] = true;
        storeOwnersCount = 0;
        adminCount = 1;
        storeCount = 0;
        productCount = 0;
        marktState = true;
    }

    /**-----------------------------------------------------------------------
        ------------------------ Admin Functions ----------------------
       -----------------------------------------------------------------------*/

    /** @dev admin allowed to add a new store owner
     * @param _newStoreOwner new store owner addrress
     */
    function addStoreOwner(address _newStoreOwner)
        public
        onlyAdmin()
        isMarketActive()
    {
        require(
            storeOwners[_newStoreOwner] == false,
            "Sorry, store owner already exists!"
        );
        storeOwners[_newStoreOwner] = true;
        storeOwnersCount = SafeMath.add(storeOwnersCount, 1);
        emit storeOwnerAdded(_newStoreOwner);
    }

    /** @dev market owner allowed to chainge marketplace state
     * @param _state new market state
     */
    function changeMarketState(bool _state) public onlyAdmin() {
        require(marktState != _state, "Sorry, this is the current state!!");
        marktState = _state;
        emit marketStateChanged(_state);
    }

    /** @dev returns the current state of marketplace */
    function getMarketState() public view returns (bool) {
        return marktState;
    }

    /** @dev returns (true) if the address is an admin, otherwise returns (false) */
    function isAdmin(address _address) public view returns (bool) {
        return admins[_address];
    }

    /** @dev returns the number of active admins */
    function getNumberOfAdmins() public view onlyAdmin() returns (uint256) {
        return adminCount;
    }

    /** @dev returns (true) if the address is store owner, otherwise returns (false) */
    function isStoreOwner(address _address) public view returns (bool) {
        return storeOwners[_address];
    }

    /** @dev returns the number of active store owners */
    function getNumberOfStoreOwners()
        public
        view
        onlyAdmin()
        returns (uint256)
    {
        return storeOwnersCount;
    }

    /** @dev returns the type of address (market owner, admin, store owner, or shopper) */
    function addressType() public view returns (addressTypes) {
        if (msg.sender == super.owner()) return addressTypes.admin;
        if (storeOwners[msg.sender]) return addressTypes.storeOwner;
        else return addressTypes.shopper;
    }

    /** @dev View contract balance
     * @return balance of all store fronts
     */

    function getContractBalance() public view onlyOwner() returns (uint256) {
        return address(this).balance;
    }

    /** @dev selfdestruct the contract to destroy the contract in case of bugs */
    function destroyContract() public onlyOwner() {
        selfdestruct(address(this));
    }

    /**-----------------------------------------------------------------------
        ------------------------ Store Owner Functions ----------------------
       -----------------------------------------------------------------------*/

    /** @dev store owner is allowed to add a new store front
     * @param _storeName new market state
     * @return the store number
     */
    function createStoreFront(string memory _storeName)
        public
        onlyStoreOwner()
        isMarketActive()
        returns (bool)
    {
        storeCount = SafeMath.add(storeCount, 1);
        storeFronts[storeCount] = StoreFront({
            storeName: _storeName,
            storeOwner: msg.sender,
            approverAdmin: address(0),
            skuCount: 0,
            balance: 0
        });
        storeOwnertoStoreFront[msg.sender].push(storeCount);
        storeFronttoStoreOwner[storeCount] = msg.sender;
        emit storeFrontCreated(storeCount, _storeName, msg.sender);
        return true;
    }

    /** @dev Store owner allowed to add a new product to their store front
     * @param _storeNum storefront number
     * @param _productName product name
     * @param _productPrice product price
     * @param _productQuantity available quantity of the product
     */

    function addProduct(
        uint256 _storeNum,
        string memory _productName,
        uint256 _productPrice,
        uint256 _productQuantity
    ) public verifyStoreOwner(_storeNum) isMarketActive() returns (uint256) {
        require(_productPrice > 0, "Sorry, invalid product price!");
        require(_productQuantity > 0, "Sorry, invalid product quantity!");
        storeFronts[_storeNum].skuCount = SafeMath.add(
            storeFronts[_storeNum].skuCount,
            1
        );
        productCount = SafeMath.add(productCount, 1);
        StoreProducts[productCount] = Product({
            name: _productName,
            storeNum: _storeNum,
            productNum: productCount,
            price: _productPrice,
            quantity: _productQuantity,
            isAvailable: true
        });
        stotrFronttoProducts[_storeNum].push(productCount);
        emit productAdded(_storeNum, _productName, productCount);
        return productCount;
    }

    /** @dev Store owner allowed to update product price
     * @param _storeNum store front number
     * @param _productNum product nunmber
     * @param _newProductPrice product price
     */

    function updateProductPrice(
        uint256 _storeNum,
        uint256 _productNum,
        uint256 _newProductPrice
    ) public verifyStoreOwner(_storeNum) isMarketActive() returns (bool) {
        require(_newProductPrice > 0, "Sorry, invalid product price!");
        StoreProducts[_productNum].price = _newProductPrice;
        emit productPriceUpdated(_storeNum, _productNum);
        return true;
    }

    /** @dev Store owner allowed to remove product
     * @param _storeNum store front number
     * @param _productNum product nunmber
     */

    function removeProduct(uint256 _storeNum, uint256 _productNum)
        public
        verifyStoreOwner(_storeNum)
        isMarketActive()
        returns (bool)
    {
        StoreProducts[_productNum].isAvailable = false;
        StoreProducts[_productNum].quantity = 0;
        emit productRemoved(_storeNum, _productNum);
        return true;
    }

    /** @dev Store owner can withdraw balance from their store fronts
     * @param _storeNum store front number
     */

    function withdraw(uint256 _storeNum)
        public
        payable
        verifyStoreOwner(_storeNum)
        isMarketActive()
    {
        require(
            storeFronts[_storeNum].balance > 0,
            "Sorry, no funds available!"
        );
        uint256 amount = storeFronts[_storeNum].balance;
        storeFronts[_storeNum].balance = 0;
        msg.sender.transfer(amount);
        emit storeWithdrawn(amount, _storeNum, msg.sender);
    }

    /** @dev return store front info
     * @param _storeNum store front number
     */

    function getStoreFrontInfo(uint256 _storeNum)
        public
        view
        returns (
            string memory,
            address,
            address,
            uint256,
            uint256
        )
    {
        return (
            storeFronts[_storeNum].storeName,
            storeFronts[_storeNum].storeOwner,
            storeFronts[_storeNum].approverAdmin,
            storeFronts[_storeNum].skuCount,
            storeFronts[_storeNum].balance
        );
    }

    /** @dev return products info
     * @param _productNum product number
     */

    function getProductInfo(uint256 _productNum)
        public
        view
        returns (
            string memory,
            uint256,
            uint256,
            uint256,
            uint256,
            bool
        )
    {
        return (
            StoreProducts[_productNum].name,
            StoreProducts[_productNum].storeNum,
            StoreProducts[_productNum].productNum,
            StoreProducts[_productNum].price,
            StoreProducts[_productNum].quantity,
            StoreProducts[_productNum].isAvailable
        );
    }

    /**-----------------------------------------------------------------------
        -------------------------- Shopper Functions ------------------------
       -----------------------------------------------------------------------*/

    /** @dev Shopper allowed to purchase a product
     * @param _storeNum store front number
     * @param _productNum product number
     */

    function purchaseProduct(uint256 _storeNum, uint256 _productNum)
        public
        payable
        onlyShopper()
        isMarketActive()
        returns (bool)
    {
        require(
            StoreProducts[_productNum].price <= msg.value,
            "Sorry, transferred value is less than the product price!"
        );
        require(
            StoreProducts[_productNum].quantity > 0,
            "Sorry, product is not available!"
        );

        uint256 quantity = SafeMath.div(
            msg.value,
            StoreProducts[_productNum].price
        );
        StoreProducts[_productNum].quantity = SafeMath.sub(
            StoreProducts[_productNum].quantity,
            quantity
        );

        if (StoreProducts[_productNum].quantity == 0) {
            StoreProducts[_productNum].isAvailable = false;
        }

        storeFronts[_storeNum].balance = SafeMath.add(
            storeFronts[_storeNum].balance,
            msg.value
        );

        emit productPurchased(_storeNum, _productNum, quantity, msg.sender);
        return true;
    }

    /** @dev fallback function */
    receive() external payable {
        revert();
    }
}
