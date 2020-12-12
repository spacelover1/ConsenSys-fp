 // this.createProduct = this.createProduct.bind(this)
    // this.purchaseProduct = this.purchaseProduct.bind(this)
    this.addStoreOwner = this.addStoreOwner.bind(this)
    // this.isAdmin = this.isAdmin.bind(this)
    // this.isStoreOwner = this.isStoreOwner.bind(this)
    // this.addressType = this.addressType.bind(this)
    // this.getContractBalance = this.getContractBalance.bind(this)
    // this.destroyContract = this.destroyContract.bind(this)
    this.createStoreFront = this.createStoreFront.bind(this)
    this.addProduct = this.addProduct.bind(this)
    this.updateProductPrice = this.updateProductPrice.bind(this)
    this.removeProduct = this.removeProduct.bind(this)
    this.withdraw = this.withdraw.bind(this)
    this.getStoreFrontInfo = this.getStoreFrontInfo.bind(this)
    this.getProductInfo = this.getProductInfo.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)


  addStoreOwner(accountAddress) {
    this.setState({ loading: true })
    storageContract.methods.addStoreOwner(accountAddress).send({ from: this.state.account[0] })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }

  createStoreFront(name) {
    this.setState({ loading: true })
    storageContract.methods.createStoreFront(name).send({ from: this.state.account[0] })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }

  addProduct(storeId, name, price, quantity) {
    this.setState({ loading: true })
    storageContract.methods.addProduct(storeId, name, price, quantity).send({ from: this.state.account[0] })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }

  updateProductPrice(storeId, productId, price) {
    this.setState({ loading: true })
    storageContract.methods.updateProductPrice(storeId, productId, price).send({ from: this.state.account[0] })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }

  removeProduct(storeId, productId) {
    this.setState({ loading: true })
    storageContract.methods.removeProduct(storeId, productId).send({ from: this.state.account[0] })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }

  withdraw(storeId) {
    this.setState({ loading: true })
    storageContract.methods.withdraw(storeId).send({ from: this.state.account[0] })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }

  getStoreFrontInfo(productId) {
    this.setState({ loading: true })
    storageContract.methods.getStoreFrontInfo(productId).send({ from: this.state.account[0] })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }


  getProductInfo(productId) {
    this.setState({ loading: true })
    storageContract.methods.getProductInfo(productId).send({ from: this.state.account[0] })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }


  purchaseProduct(storeId, productId) {
    this.setState({ loading: true })
    storageContract.methods.purchaseProduct(storeId, productId).send({ from: this.state.account[0] })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }


  render() {
    const AddressType = this.state.addressType;
    return ( 
    <div>
      <Navbar account={this.state.account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex">
            { this.state.loading
              ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
              : <Main
                products={this.state.products}
                createProduct={this.createProduct}
                purchaseProduct={this.purchaseProduct} />
            }
          </main>
        </div>
      </div>
    </div>

    );
  }
}

export default App;