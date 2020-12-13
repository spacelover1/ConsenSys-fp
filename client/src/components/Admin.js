/*eslint-disable eqeqeq*/

import React, { Component } from "react";

class Admin extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      numAdmin: '', storeNums: '', numStoreOwners: '', addStoreOwner: '', IsStoreOwner: '',
      IsAdmin: '', accounts: this.props.accounts, contract: this.props.contract,
      MarketState: this.props.MarketState
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
    const marketState = await contract.getMarketState.call({ from: accounts[0] });
    const admins = await contract.getNumberOfAdmins.call({ from: accounts[0] });
    const storeOwners = await contract.getNumberOfStoreOwners.call({ from: accounts[0] });
    let storeNums = [];


    const storeFrontCount = await contract.getStoreFrontCount.call({ from: accounts[0] });

    // for (let i = 0; i < storeFrontCount; i++) {
    //   const storeFront = await contract.getStoreFrontInfo.call(i, { from: accounts[0] });
    //   if (!storeFront[5] && storeFront[2] == "0x0000000000000000000000000000000000000000") {
    //     pendingList.push("Store Number: " + i + " , Store Name: " + storeFront[0]);
    //     storeNums.push(i);
    //   }
    // }

    this.setState({
      numAdmin: admins, numStoreOwners: storeOwners,
      MarketState: marketState, storeNums: storeNums
    });

  };
  handleChange(event) { this.setState({ [event.target.name]: event.target.value });}

  IsAdmin(event) { 
    event.preventDefault();
    const { accounts, contract } = this.state;	
    var value = this.state.IsAdmin;
    if(!value) {
      alert("Please enter the address");
   } else{
      contract.isAdmin(value, {from : accounts[0]}).then(result => {  		
      if(result) {
        alert(value + " is an admin address");
      }else{
        alert(value + " is Not an admin address!");
      }
     });
     this.setState({ IsAdmin: ''});
    }
}

ChangeMarketState(event) {
  event.preventDefault();
  const { accounts, contract, MarketState } = this.state;	
  alert('Do you want to change market state?');
  contract.changeMarketState(!MarketState, {from : accounts[0]}).then(result => {
    this.start();
    this.forceUpdate(); 
  });
}

AddNewStoreOwner(event) { 
  event.preventDefault();
  const { accounts, contract } = this.state;	
  var value = this.state.addStoreOwner;
  if(!value) {
    alert("Please enter the address");
 } else{
    var check = contract.isStoreOwner(value, {from : accounts[0]}).then(result => {
      if (!result){
         contract.addStoreOwner(value, {from : accounts[0]}).then(result => {
           this.forceUpdate();
         });
        
      }else{
       alert("Address is a store owner");
      }
      this.setState({ addStoreOwner: ''});
    });
    
   }
}

IsStoreOwner(event) { 
  event.preventDefault();
  const { accounts, contract } = this.state;	
  var value = this.state.IsStoreOwner;
  if(!value) {
    alert("Please enter the address");
 } else{
    contract.isStoreOwner(value, {from : accounts[0]}).then(result => {  		
    if(result) {
      alert(value + " is an store owner address");
    }else{
      alert(value + " is Not an srote owner address!");
    }
   });
   this.setState({ IsStoreOwner: ''});
  }
}



render() {


  return (
  <form >
  <div>
    <h3> Logged as Admin</h3> 
    <h4> Number of Store Owners = {String(this.state.numStoreOwners)}</h4>
  </div>
  <div >
    <h2>Add a New Store Owner</h2>
    <li><input type="text" ref="admininput" name="addStoreOwner" value={this.state.addStoreOwner} onChange={this.handleChange} placeholder="Store Owner Address"/></li>
    <li><button onClick={this.AddNewStoreOwner.bind(this)}>Add</button></li>
    <br/>
  </div>
  <br/>
  <div>
    <h2>Check Store Owner Address</h2>
    <li><input type="text" ref="admininput3" name="IsStoreOwner" value={this.state.IsStoreOwner} onChange={this.handleChange} placeholder="Admin Address"/></li>
    <li><button onClick={this.IsStoreOwner.bind(this)}>Check</button> </li>
  </div>
  <br/>
  <div>
    <h2>change Market State</h2>
    <button onClick={this.ChangeMarketState.bind(this)}>Change Market State</button>
  </div>
  </form>	
    );
  }
}
export default Admin;

