/*eslint-disable eqeqeq*/

import React, { Component } from "react";


class Shopper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      productsList: [], AvaProductsList: [], emptyStore: [],
      storeNum: '', productN: '', productP: '', accounts: this.props.accounts,
      contract: this.props.contract
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
    const { accounts, contract, web3 } = this.state;
    // var plist=[];

    const _StoreFrontIds = await contract.getStoreFrontCount.call({ from: accounts[0] });

    for (let i = 1; i < _StoreFrontIds; i++) {
      const storeFront = await contract.getStoreFrontInfo(i, { from: accounts[0] });
      this.StoreProductsList(i);
    }
  };



  handleChange(event) { this.setState({ [event.target.name]: event.target.value }); }


  StoreProductsList = async (storeNum) => {
    const { contract, accounts } = this.state;
    const data = await contract.getProductsByStoreFront(storeNum, { from: accounts[0] });
    var productsData = this.state.productsList;
    var AvaProductsData = this.state.AvaProductsList;
    var emptyStore = this.state.emptyStore;
    if (data.length == 0) {
      emptyStore.push(`Store number: ${storeNum}`);
    } else {
      for (var i = 0; i < data.length; i++) {
        var pData = await contract.getProductInfo(data[i], { from: accounts[0] });
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
      productsList: productsData, AvaProductsList: AvaProductsData,
      emptyStore: emptyStore
    });
  }

  buy(event) {
    event.preventDefault();
    const { accounts, contract } = this.state;
    var { storeNum, productN, productP } = this.state;
    if (!storeNum, !productN, !productP) {
      alert("Please enter values");
    } else {
      contract.purchaseProduct(storeNum, productN,
        { from: accounts[0], value: productP }).then(result => {
          //this.start(); 
          this.forceUpdate();
          alert("Please refresh page");
        });
      this.setState({ storeNum: '', productN: '', productP: '' });
    }
  }

  render() {

    var emptyList = this.state.emptyStore;
    var productsList = this.state.productsList;
    var AvaProductsList = this.state.AvaProductsList;

    return (
      <form >
        <div>
          <h3> Logged as Shopper</h3>
        </div>
        <div >
          <h2>buy product</h2>
          <li><input type="text" ref="shopperInput" name="productN" value={this.state.productN} onChange={this.handleChange} placeholder="product number" /></li>
          <li><input type="text" ref="shopperInput4" name="storeNum" value={this.state.storeNum} onChange={this.handleChange} placeholder="store number" /></li>

          <li><input type="text" ref="shopperInput2" name="productP" value={this.state.productP} onChange={this.handleChange} placeholder="product price in wei" /></li>

          <li><button onClick={this.buy.bind(this)}>Buy</button></li>
          <br />
        </div>

        <br />
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
          <h5>Empty Stores are:
            {emptyList.map(function (emptyList, index) {
            return <div key={index}>{emptyList}</div>;
          })}
          </h5>
          <br />
        </div>
      </form>
    );
  }
}
export default Shopper;
