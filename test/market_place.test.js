var MarketPlace = artifacts.require("MarketPlace");

contract("MarketPlace", function(accounts) {

  const admin = accounts[0];
  const admin2 = accounts[1];
  const storeOwner = accounts[2];
  const shopper = accounts[3];
  const storeName = "Store X";
  const storeNum = 1;

 /** Test Admin main function */
 describe("Admin functionality", ()=>{


//@notce  Admin can add a new store owner

  it("Admin is able to add a new store owner", async() => {
    var marketplace = await MarketPlace.deployed();

    let result  = await marketplace.addStoreOwner(storeOwner, {from: admin});

    assert.equal(result.logs[0].event, "storeOwnerAdded");
    assert.equal(await marketplace.isStoreOwner(storeOwner, {from:admin}), true);
    assert.equal(await marketplace.addressType({from:storeOwner}), 1 );
  });


    /** @tile Test 3
      * @notce  admin is the only user who can change Market State 
    */
   it("Admin is able to change Market State", async() => {
    var marketplace = await MarketPlace.deployed();

    let result = await marketplace.changeMarketState(false, {from: admin});
    
    assert.equal(result.logs[0].event, "marketStateChanged");
    assert.equal(await marketplace.getMarketState({from:storeOwner}), false);

    await marketplace.changeMarketState(true, {from: admin});
    });




 });
  
   
  /** Test Store Owner main functions */
  describe("**Store Owner functionality", ()=>{
    
    
//@notce  store owner is the only user type who can create store front
    
    it("Store Owner is able to create a new store front", async() => {
      var marketplace = await MarketPlace.deployed();
      
      let result  = await marketplace.createStoreFront(storeName, {from: storeOwner});
      
      assert.equal(result.logs[0].event, "storeFrontCreated");
      assert.equal(result.logs[0].args.storeName, storeName);
      assert.equal(result.logs[0].args.storeOwner, storeOwner);
      
    });



// @notce  store owner is the only user type who can add a product 

   it("Store Owner is able to add a new product", async() => {
    var marketplace = await MarketPlace.deployed();
    
    let result  = await marketplace.addProduct(storeNum, "item1", 10,2, {from: storeOwner});

    let product = await marketplace.getProductInfo((result.logs[0].args.productNum), {from: storeOwner});
    
    assert.equal(result.logs[0].event, "productAdded");
    assert.equal(product[1].toNumber(), storeNum);
    assert.equal(product[0], "item1");
    assert.equal(product[3].toNumber(), 10);
    assert.equal(product[4].toNumber(), 2);
    assert.equal(product[2].toNumber(), (result.logs[0].args.productNum).toNumber());
    
  });
  
  

// @notce  store owner is the only user type who can update product price

    it("Store Owner is able to update product price", async() => {
      var marketplace = await MarketPlace.deployed();
      
      
      
      let addproduct = await marketplace.addProduct(storeNum, "item1", 10,2, {from: storeOwner});
      let result  = await marketplace.updateProductPrice(storeNum, (addproduct.logs[0].args.productNum).toNumber(), 30, {from: storeOwner});
      
      let product = await marketplace.getProductInfo((result.logs[0].args.productNum), {from: storeOwner});
    
      assert.equal(result.logs[0].event, "productPriceUpdated");
      assert.equal(product[1].toNumber(), storeNum);
      assert.equal(product[3].toNumber(), 30);
      assert.equal(product[2].toNumber(), (result.logs[0].args.productNum).toNumber());
      
    }); 

 
// @notce  store owner is the only user type who can remove product 

    it("Store Owner is able to remove product", async() => {
      var marketplace = await MarketPlace.deployed();
    
    
    
      let addproduct = await marketplace.addProduct(storeNum, "item1", 10,2, {from: storeOwner});
      let result  = await marketplace.removeProduct(storeNum, (addproduct.logs[0].args.productNum).toNumber(), {from: storeOwner});
  
      let product = await marketplace.getProductInfo((result.logs[0].args.productNum), {from: storeOwner});

      assert.equal(result.logs[0].event, "productRemoved");
      assert.equal((result.logs[0].args.storeNum).toNumber(), storeNum);
      assert.equal((result.logs[0].args.productNum).toNumber(), (addproduct.logs[0].args.productNum).toNumber());
      assert.equal(product[5], false);
      assert.equal(product[4].toNumber(), 0);
    
  }); 


 
//@notce  store owner can withdraw funds

   it("Store owner able to withdraw funds", async() => {
    const price = 10;
    const amount = 30;
    const quantity = 6;

    var marketplace = await MarketPlace.deployed();
  
    let addproduct = await marketplace.addProduct(storeNum, "item1", price, quantity, {from: storeOwner});
    await marketplace.purchaseProduct(storeNum, (addproduct.logs[0].args.productNum).toNumber(), {from: shopper, value: amount});

    let storeInfo = await marketplace.getStoreFrontInfo(storeNum, {from: storeOwner});
    const storeBalanceBefore = (storeInfo[4]).toNumber();

    const contractBalanceBefore = (await marketplace.getContractBalance({from: admin})).toNumber();

    let result  = await marketplace.withdraw(storeNum,{from: storeOwner});

    const contractBalanceAfter = (await marketplace.getContractBalance({from: admin})).toNumber();

    let storeInfo2 = await marketplace.getStoreFrontInfo(storeNum, {from: storeOwner});
    const storeBalanceAfter = (storeInfo2[4]).toNumber();
    

    assert.equal(result.logs[0].event, "storeWithdrawn");
    assert.equal((result.logs[0].args.amount).toNumber(), storeBalanceBefore);
    assert.equal((result.logs[0].args.storeNum).toNumber(), storeNum);
    assert.equal(result.logs[0].args.storeOwner, storeOwner);
    assert.equal(contractBalanceAfter, contractBalanceBefore - storeBalanceBefore);
    assert.isBelow(contractBalanceAfter,storeBalanceBefore);
  
}); 

  
  });   

  /** Test Shopper main function */
  describe("Shopper  functionality", ()=>{

// @notice shopper can pruchase a product
  
   it("Shopper is able to purchase a product", async() => {
    const price = 10;
    const amount = 30;
    const quantity = 6;

    var marketplace = await MarketPlace.deployed();
  
    let addproduct = await marketplace.addProduct(storeNum, "item1", price, quantity, {from: storeOwner});
    const shopperBalanceBefore = await web3.eth.getBalance(shopper);
    const contractBalanceBefore = (await marketplace.getContractBalance({from: admin})).toNumber();

    let result  = await marketplace.purchaseProduct(storeNum, (addproduct.logs[0].args.productNum).toNumber(), {from: shopper, value: amount});
    const shopperBalanceAfter = await web3.eth.getBalance(shopper);
    const contractBalanceAfter = (await marketplace.getContractBalance({from: admin})).toNumber();

    let product = await marketplace.getProductInfo((result.logs[0].args.productNum), {from: storeOwner});

    assert.equal(result.logs[0].event, "productPurchased");
    assert.equal((result.logs[0].args.storeNum).toNumber(), storeNum);
    assert.equal((result.logs[0].args.productNum).toNumber(), (addproduct.logs[0].args.productNum).toNumber());
    assert.equal((result.logs[0].args.quantity).toNumber(), amount/price);
    assert.equal(result.logs[0].args.shopper, shopper);
    assert.equal(contractBalanceAfter, contractBalanceBefore + amount);
    assert.isBelow(parseInt(shopperBalanceAfter), parseInt(shopperBalanceBefore) - parseInt(amount) );
  
    }); 

  });
});