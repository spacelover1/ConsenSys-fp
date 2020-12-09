require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {

  networks: {

    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: "*" // Any network (default: none)
    },
    ropsten: {

      provider: () =>
      new HDWalletProvider(
        process.env.MNEMONIC,
        `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      ),
    
    network_id: 3,       // Ropsten's id
    gas: 8000000,        // Ropsten has a lower block limit than mainnet
    gasPrice: 10000000000,
    confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },

  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.6.2"    // Fetch exact version from solc-bin (default: truffle's version)

    },
  },
};
