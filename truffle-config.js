module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    test: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id for test configurations
    }
  },
  compilers: {
    solc: {
      version: "0.8.0", // Use Solidity version 0.8.0
      settings: {
        optimizer: {
          enabled: true,
          runs: 200 // Optimize for how many times you intend to run the code
        },
        // Specify other settings like evmVersion if needed
      }
    }
  }
};
