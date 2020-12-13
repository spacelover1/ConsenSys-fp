import React, { Component } from 'react';
import { MarketPlace } from './abi/abi'
import Web3 from 'web3';
import Header from './components/Header';
import Admin from './components/Admin';
import StoreOwner from './components/StoreOwner';
import Shopper from './components/Shopper';
import './App.css';

const web3 = new Web3(Web3.givenProvider);

class App extends React.Component {

  state = {
    MarketState: null,
    addressType: null,
    web3: null,
    accounts: null,
    contract: null,
    balance: null
  }
  
  componentDidMount = async() =>{
    try{

      const accounts = await web3.eth.getAccounts();
      const balance = await web3.eth.getBalance(accounts[0]);

      const contractAddress = "0x38514b09cc40C815dd4Ee6F5A4a24F7C3Ba5118A";
      const storageContract = new web3.eth.Contract(MarketPlace, contractAddress);
      this.setState({ web3, accounts, contract: storageContract, balance}, this.start);



    }catch(error) {
      alert("ERROR:" + error);
    }
       
  };
  
  start = async() =>{
    console.log("---------------1---------------------");
    const{accounts, contract} = this.state;
    const addressType = await contract.methods.addressType().call({from: accounts[0]});
    const _MarketState = await contract.methods.getMarketState().call({from: accounts[0]});
    console.log("------------------2------------------");
    this.setState({addressType: addressType,  MarketState: _MarketState});
    console.log("------------------3------------------");
  };

render() {
  const AddressType = this.state.addressType;
  return (
    <React.Fragment>
      <div>  	<Header {...this.state} /> </div>
      <div>
        {
          (() => {
            if (AddressType == 0)
              return <div><Admin {...this.state} /> </div>
            else if (AddressType == 1)
              return <div><StoreOwner {...this.state} /> </div>
            else if (AddressType == 2)
              return <div><Shopper {...this.state} /> </div>
          })()
        }
      </div>
    </React.Fragment>
  );
}
}
export default App;
