/*eslint-disable eqeqeq*/

import React, { Component } from "react";

class StoreOwner extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      pageone: true, pagetwo: false, ProductsTable: false, storeBalance: '',
      ProductNum: '', ProductNum2: '', NewPrice: '', pQuant: '',
      pName: '', pPrice: '', AvaProductsList: [], productsList: [], balance: '',
      CreateStoreFront: '', selectedStore: '',
      accounts: this.props.accounts, contract: this.props.contract
    };
  }

  componentDidMount = async () => {
    try {
      this.start();
      this.handleChange = this.handleChange.bind(this);
    } catch (error) {
      alert("Error: " + error);
    }
  };

  start = async () => {
    const { accounts, contract } = this.state;
    // let pendingStores = [];
    // let approvedStores = [];
    // let activeStores = [];
    let balance = 0;
    try {
      const storeFrontList = await contract.methods.getStoreFrontByStoreOwner().call({ from: accounts[0] });

      for (let storenum of storeFrontList) {
        const storeFront = await contract.methods.getStoreFrontInfo(storenum, { from: accounts[0] });

        if (storeFront[2] == "0x0000000000000000000000000000000000000000") {

          // pendingStores.push("Store Number: "+storenum+" , Store Name: "+storeFront[0]);
        } else {
          if (storeFront[5]) {
            // activeStores.push(storenum);
            // approvedStores.push(storenum);
            balance += parseInt(storeFront[4]);
          }
        }
      }
    } catch (error) {
      alert("Error: " + error);
    }
    // this.setState({pendingStores: pendingStores, approvedStores: approvedStores, activeStores: activeStores, balance: balance });
  };

  handleChange = event => { this.setState({ [event.target.id]: event.target.value }); }

  CreateStoreFront(event) {
    event.preventDefault();
    const { accounts, contract } = this.state;
    var value = this.state.CreateStoreFront;
    if (!value) {
      alert("Please enter a store name");
    } else {
      contract.methods.createStoreFront(value, { from: accounts[0] }).then(result => {
        this.start();
        this.forceUpdate();
      });
      this.setState({ CreateStoreFront: '' });
    }
  }
  StoreProductsList = async (ManageStore) => {
    const { contract, accounts } = this.state;
    const storeFront = await contract.methods.getStoreFrontInfo(ManageStore, { from: accounts[0] });
    var storeBalance = storeFront[4];
    const data = await contract.methods.getProductsByStoreFront(ManageStore, { from: accounts[0] });
    var productsData = [];
    var AvaProductsData = [];
    if (data.length == 0) {
      productsData.push("The store is empty! No Products found!");
      this.setState({ ProductsTable: false });
    } else {
      this.setState({ ProductsTable: true });
      for (var i = 0; i < data.length; i++) {
        var pData = await contract.methods.getProductInfo(data[i], { from: accounts[0] });
        if (pData[5] && pData[4] > 0) {
          AvaProductsData.push("Store Num: " + pData[1] +
            "  ,  Name:  " + pData[0] +
            "  ,  Product Num: " + pData[2] +
            "  ,  Price: " + pData[3] +
            "  ,  Quantity: " + pData[4] +
            "  ,  Available: " + pData[5]);
        } else {
          productsData.push("Store Num: " + pData[1] +
            "  ,  Name: " + pData[0] +
            "  ,  Product Num: " + pData[2] +
            "  ,  Price: " + pData[3] +
            "  ,  Quantity: " + pData[4] +
            "  ,  Available: " + pData[5]);
        }
      }
    }
    this.setState({
      storeBalance: storeBalance, ManageStore: '', selectedStore: ManageStore,
      pageone: false, pagetwo: true, productsList: productsData,
      AvaProductsList: AvaProductsData
    });
  }
  ManageStore(event) {
    event.preventDefault();
    const { accounts, contract } = this.state;
    var value = this.state.ManageStore;
    if (!value) {
      alert("Please enter a store number");
    } else {
      this.StoreProductsList(value);
    }
  }

  goBack = () => {
    this.setState({
      pageone: true,
      pagetwo: false,
      selectedStore: ""
    });
  }

  AddProduct(event) {
    event.preventDefault();
    const { accounts, contract } = this.state;
    var { pName, pPrice, pQuant } = this.state;
    if (!pName && !pPrice && pQuant) {
      alert("Please enter values");
    } else {
      contract.methods.addProduct(this.state.selectedStore, pName, pPrice, pQuant, { from: accounts[0] }).then(result => {
        this.start();
        this.forceUpdate();
        alert("Please refresh page");
      });
      this.setState({ pQuant: '', pName: '', pPrice: '' });
    }
  }

  UpdatePriceProduct(event) {
    event.preventDefault();
    const { accounts, contract } = this.state;
    var { NewPrice, ProductNum } = this.state;
    if (!NewPrice && !ProductNum) {
      alert("Please enter values");
    } else {
      contract.methods.updateProductPrice(this.state.selectedStore, ProductNum, NewPrice, { from: accounts[0] }).then(result => {
        this.start();
        this.forceUpdate();
        alert("Please refresh page");
      });
      this.setState({ ProductNum: '', NewPrice: '' });
    }
  }

  DeleteProduct(event) {
    event.preventDefault();
    const { accounts, contract } = this.state;
    var ProductNum = this.state.ProductNum2;
    if (!ProductNum) {
      alert("Please enter values");
    } else {
      contract.methods.removeProduct(this.state.selectedStore, ProductNum, { from: accounts[0] }).then(result => {
        this.start();
        this.forceUpdate();
        alert("Please refresh page");
      });
      this.setState({ ProductNum2: '' });
    }
  }

  WithdrawBalance(event) {
    event.preventDefault();
    const { accounts, contract } = this.state;
    var balance = this.state.storeBalance;
    if (balance > 0) {
      contract.methods.withdraw(this.state.selectedStore, { from: accounts[0] }).then(result => {
        this.start();
        this.forceUpdate();
        balance = 0;
        this.setState({ storeBalance: balance });
        alert("Please refresh page");
      });

    } else {
      alert("Balance is Zero!");
    }
  }


  render() {
    // var numActiveStores = this.state.activeStores.length;
    // var numApprovedStores =  this.state.approvedStores.length;
    // var numPendingStores =  this.state.pendingStores.length;
    // var activeStorelist = this.state.activeStores;
    var productsList = this.state.productsList;
    var AvaProductsList = this.state.AvaProductsList;

    return (
      <form>
        <div>  {this.state.pageone ?
          <ul>
            <div>
              <h3> Logged as a Store Owner</h3>
              {/* <h4>Active stores = {numActiveStores} | Approved Stores = {numApprovedStores} | Pendding Sotres = {numPendingStores} | Total Balance = {String(this.state.balance)} wei</h4> */}
            </div>
            <div >
              <h2>Create a New Store Front</h2>
              <li><input type="text" ref="admininput" id="CreateStoreFront" value={this.state.CreateStoreFront} onChange={this.handleChange} placeholder="Store Name" /></li>
              <li><button onClick={this.CreateStoreFront.bind(this)}>Create</button></li>
              <br />
            </div>
            <div>
              <h2>Manage a Store Front</h2>
              <li><input type="text" ref="admininput2" id="ManageStore" value={this.state.ManageStore} onChange={this.handleChange} placeholder="Enter Store Number" /></li>
              <li><button onClick={this.ManageStore.bind(this)}>ManageStore</button> </li>
            </div>
            <br />
            {/* <div>
            <h5>Active Store Fronts are:
                {activeStorelist.map(function(activeStorelist, index){
                 return <div key={ index }>Store Number : {activeStorelist.toString()}</div>;
                 })}
            </h5>
            </div> */}
          </ul>
          :
          <ul>
            <div>
              <li><button onClick={this.goBack}>Back</button></li>
            </div>
            <div>
              <h5>Products List are: (Avaiable)
            {AvaProductsList.map(function (AvaProductsList, index) {
                return <div key={index}>{AvaProductsList}</div>;
              })}
              </h5>
              <br />
              <h5>Products List are: (Not Avaiable)
            {productsList.map(function (productsList, index) {
                return <div key={index}>{productsList}</div>;
              })}
              </h5>
              <br />
            </div>
            <div>
              <h2>Add Product</h2>
              <li><input type="text" ref="ownerinput3" id="pName" value={this.state.pName} onChange={this.handleChange} placeholder="Product Name" /></li>
              <li><input type="text" ref="ownerinput4" id="pPrice" value={this.state.pPrice} onChange={this.handleChange} placeholder="Product Price in wei" /></li>
              <li><input type="text" ref="ownerinput5" id="pQuant" value={this.state.pQuant} onChange={this.handleChange} placeholder="Product Quantity" /></li>
              <li><button onClick={this.AddProduct.bind(this)}>Add</button> </li>
              <br />
            </div>
            <div>
              <t> {this.state.ProductsTable ?
                <tdiv><div>
                  <h2>Update Price</h2>
                  <li><input type="text" ref="ownerinput6" id="ProductNum" value={this.state.ProductNum} onChange={this.handleChange} placeholder="Product Number" /></li>
                  <li><input type="text" ref="ownerinput7" id="NewPrice" value={this.state.NewPrice} onChange={this.handleChange} placeholder="New Price in wei" /></li>
                  <li><button onClick={this.UpdatePriceProduct.bind(this)}>Update</button> </li>
                  <br />
                </div>
                  <div>
                    <h2>Delete product</h2>
                    <li><input type="text" ref="ownerinput8" id="ProductNum2" value={this.state.ProductNum2} onChange={this.handleChange} placeholder="Product Number" /></li>
                    <li><button onClick={this.DeleteProduct.bind(this)}>Delete</button> </li>
                    <br />
                  </div></tdiv>
                : null}
              </t>
            </div>
            <div>
              <h2>Withdraw Store Front Balance</h2>
              <h4>Balance is {String(this.state.storeBalance)} wei</h4>
              <li><button onClick={this.WithdrawBalance.bind(this)}>Withdraw</button></li>
              <br />
            </div>

          </ul>
        }

        </div>
      </form>
    );
  }
}
export default StoreOwner;