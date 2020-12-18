import React from 'react';
import { MarketPlace } from './abi/abi';
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
    componentDidMount = async () => {
        try {
            const accounts = await window.ethereum.enable();
            // const accounts = await web3.eth.getAccounts();
            // console.log( 'accounts');
            // console.log( accounts);
            const balance = await web3.eth.getBalance(accounts[0]);
            // console.log( 'balance');
            // console.log( balance);
            const contractAddress = "0x222e6F9Ff304d4c9Ba986fe040394a52C0dFA803";
            const storageContract = new web3.eth.Contract(MarketPlace, contractAddress);
 

            this.setState({ web3, accounts, contract: storageContract, balance }, this.start);


        } catch (error) {
            // console.log(contractAddress);
            alert("componentDidMount:" + error);
        }

    };

    // async componentWillMount() {
    //     await this.loadWeb3()
    //     console.log(window.web3)
    //     // await this.loadBlockchainData()
    //   }
    
    //   async loadWeb3() {
    //     if (window.ethereum) {
    //       window.web3 = new Web3(window.ethereum)
    //       await window.ethereum.enable()
    //     }
    //     else if (window.web3) {
    //       window.web3 = new Web3(window.web3.currentProvider)
    //     }
    //     else {
    //       window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    //     }
    //   }
   


    start = async () => {
        console.log("---------------1---------------------");
        const { accounts, contract } = this.state;
        const addressType = await contract.methods.addressType().call({ from: accounts[0] });
        const marketStateInstance = await contract.methods.getMarketState().call({ from: accounts[0] });
        console.log("------------------2------------------");
        this.setState({ addressType: addressType, MarketState: marketStateInstance });
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