//SPDX-License-Identifier: MIT

pragma solidity >=0.5.16<0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

///@title MarketPlace DApp
///@author Zeinab-Salimi
///@notice Simple Market Place for Consensys 2020 Bootcamp Final Project


contract MarketPlace is Ownable {
    
    //Uses SafeMath library to avoid integer overflow/underflow attacks
    using SafeMath for uint; 

    uint public storeOwnersCount;
    uint public adminCount;
    uint public storeCount;
    uint public productCount;
    mapping (address => bool) public admins;
    mapping (address => bool) public storeOwners;
    mapping(uint => StoreFront) public storeFronts;
    mapping(address => uint[]) public storeOwnertoStoreFront;
    mapping(uint => address) public storeFronttoStoreOwner;
    mapping(uint => Product) public StoreProducts;
    mapping(uint => uint[]) public stotrFronttoProducts;


    struct StoreFront {
        string storeName;
        address storeOwner;
        address approverAdmin;
        uint skuCount;
        uint balance;
    }
    
    struct Product {
        string name;
        uint storeNum;
        uint productNum;
        uint price;
        uint quantity;
        bool isAvailable;
    } 


    enum addressTypes {admin, storeOwner, shopper}

    event adminAdded(address newAdmin);
    event adminRemoved(address admin);
    event storeOwnerAdded(address newStoreOwner);
    event storeOwnerRemoved(address storeOwner);
    event storeFrontCreated(uint storeNum, string storeName, address storeOwner);
    event storeFrontApproved(uint storeNum, address admin);
    event productAdded(uint storeNum, string productName, uint productNum);
    event productPriceUpdated(uint storeNum, uint productNum);
    event productRemoved(uint storeNum, uint productNum);
    event storeWithdrawn(uint amount, uint storeNum, address storeOwner);
    event productPurchased(uint storeNum, uint productNum, uint quantity, address shopper);


    /** @dev verifies the msg.sender is an admin */
    modifier onlyAdmin() {require(admins[msg.sender], "Sorry, you are not admin!"); _;}

    /** @dev verifies the msg.sender is the store owner */
    modifier onlyStoreOwner() {require(storeOwners[msg.sender], "Sorry, you are not a store owner!"); _;}

    /** @dev verifies the msg.sender is not a store owner or admin */
    modifier onlyShopper(){require(!storeOwners[msg.sender], "Sorry, store owner is not allowed to buy products!"); 
    require(!admins[msg.sender], "Sorry, admin is not allowed to buy products!"); _;}



    /** @dev constracter initalises state variables */
    constructor() public {
        admins[msg.sender] = true;
        storeOwnersCount = 0;
        adminCount = 1;
        storeCount = 0;
        productCount = 0;
    }

    
    /** @dev admin allowed to add a new store owner 
      * @param _newStoreOwner new store owner addrress 
    */
    function addStoreOwner(address _newStoreOwner) public onlyAdmin() {
        require(storeOwners[_newStoreOwner] == false, "Sorry, store owner already exists!");
        storeOwners[_newStoreOwner] = true;
        storeOwnersCount = SafeMath.add(storeOwnersCount, 1);
        emit storeOwnerAdded(_newStoreOwner);
    }


    /** @dev returns (true) if the address is an admin, otherwise returns (false) */
    function isAdmin(address _address) public view returns(bool) {
        return admins[_address];
    }

    /** @dev returns (true) if the address is store owner, otherwise returns (false) */
    function isStoreOwner(address _address) public view returns(bool) {
        return storeOwners[_address];
    }

    /** @dev returns the type of address (market owner, admin, store owner, or shopper) */
    function addressType() public view returns(addressTypes) {

        if(msg.sender == super.owner())
            return addressTypes.admin;
        if(storeOwners[msg.sender])
            return addressTypes.storeOwner;
        else
            return addressTypes.shopper;
    }

    /** @dev View contract balance
      * @return balance of all store fronts
    */ 
    function getContractBalance() public view onlyOwner() returns(uint){
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
    function createStoreFront(string memory _storeName) public  onlyStoreOwner() returns(bool){   
        storeCount = SafeMath.add(storeCount, 1);
        storeFronts[storeCount] = StoreFront({storeName: _storeName, storeOwner: msg.sender, approverAdmin: address(0), skuCount: 0, balance: 0});
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
    function addProduct(uint _storeNum, string memory _productName, uint _productPrice, uint _productQuantity) 
    public returns(uint){
        // require(storeFronts[_storeNum].state == true,  "Sorry, store front is not approved yet!");
        require(_productPrice > 0, "Sorry, invalid product price!");
        require(_productQuantity > 0, "Sorry, invalid product quantity!");
        storeFronts[_storeNum].skuCount = SafeMath.add(storeFronts[_storeNum].skuCount, 1);
        productCount = SafeMath.add(productCount,1);
        StoreProducts[productCount]= Product({name: _productName,  storeNum: _storeNum, productNum: productCount, price: _productPrice, quantity: _productQuantity, isAvailable: true});
        stotrFronttoProducts[_storeNum].push(productCount);
        emit productAdded(_storeNum, _productName, productCount);
        return productCount;
    }

    /** @dev Store owner allowed to update product price
      * @param _storeNum store front number
      * @param _productNum product nunmber
      * @param _newProductPrice product price
    */   
    function updateProductPrice(uint _storeNum, uint _productNum, uint _newProductPrice) 
    public returns(bool){
        // require(storeFronts[_storeNum].state == true,  "Sorry, store front is not approved yet!");
        require(_newProductPrice > 0, "Sorry, invalid product price!");
        StoreProducts[_productNum].price = _newProductPrice;
        emit productPriceUpdated(_storeNum, _productNum);
        return true;
    }

    /** @dev Store owner allowed to remove product
      * @param _storeNum store front number
      * @param _productNum product nunmber
    */   
    function removeProduct(uint _storeNum, uint _productNum) 
    public returns(bool){
        // require(storeFronts[_storeNum].state == true,  "Sorry, store front is not approved yet!");
        StoreProducts[_productNum].isAvailable = false;
        StoreProducts[_productNum].quantity = 0;
        emit productRemoved(_storeNum, _productNum);
        return true;
    }

    /** @dev Store owner can withdraw balance from their store fronts 
      * @param _storeNum store front number
    */ 
    function withdraw(uint _storeNum) 
    public payable {
        require(storeFronts[_storeNum].balance > 0, "Sorry, no funds available!");
        uint amount = storeFronts[_storeNum].balance;
        storeFronts[_storeNum].balance = 0;
        msg.sender.transfer(amount);
        emit storeWithdrawn(amount, _storeNum, msg.sender);
    }

    /** @dev return store front info
      * @param _storeNum store front number
    */ 
    function getStoreFrontInfo(uint _storeNum) 
    public view returns(string memory, address, address, uint, uint){
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
    function getProductInfo(uint _productNum) 
    public view returns(string memory, uint, uint, uint, uint, bool){
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
    function purchaseProduct( uint _storeNum, uint _productNum) 
    public payable onlyShopper() returns(bool){
        require(StoreProducts[_productNum].price <= msg.value, "Sorry, transferred value is less than the product price!");
        require(StoreProducts[_productNum].quantity > 0, "Sorry, product is not available!");
        
        uint quantity = SafeMath.div(msg.value, StoreProducts[_productNum].price);
        StoreProducts[_productNum].quantity = SafeMath.sub(StoreProducts[_productNum].quantity, quantity);
        
        if (StoreProducts[_productNum].quantity == 0){
            StoreProducts[_productNum].isAvailable = false;}
        
        storeFronts[_storeNum].balance = SafeMath.add(storeFronts[_storeNum].balance,msg.value);
        
        emit productPurchased(_storeNum, _productNum, quantity, msg.sender);
        return true;
    }

    /** @dev fallback function */
    receive() external payable {
        revert();
    }


}
