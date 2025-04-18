export const DORA_CONFIG = {
  testnet: {
    rpc: "https://vota-testnet-rpc.dorafactory.org",
    rest: "https://vota-testnet-rest.dorafactory.org",
    nodeProvider: {
      name: "Dorafactory",
      email: "node-operation@mail.dorafactory.org",
      website: "https://dorafactory.org",
    },
    chainId: "vota-testnet",
    chainName: "Dora Vota Testnet",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/vota-testnet/chain.png",
    stakeCurrency: {
      coinDenom: "DORA",
      coinMinimalDenom: "peaka",
      coinDecimals: 18,
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/vota-testnet/peaka.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "dora",
      bech32PrefixAccPub: "dorapub",
      bech32PrefixValAddr: "doravaloper",
      bech32PrefixValPub: "doravaloperpub",
      bech32PrefixConsAddr: "doravalcons",
      bech32PrefixConsPub: "doravalconspub",
    },
    currencies: [
      {
        coinDenom: "DORA",
        coinMinimalDenom: "peaka",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/vota-testnet/peaka.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "DORA",
        coinMinimalDenom: "peaka",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/vota-testnet/peaka.png",
        gasPriceStep: {
          low: 100000000000,
          average: 100000000000,
          high: 100000000000,
        },
      },
    ],
    features: [],
  },
  mainnet: {
    rpc: "https://vota-rpc.dorafactory.org",
    rest: "https://vota-rest.dorafactory.org",
    nodeProvider: {
      name: "Dorafactory",
      email: "node-operation@mail.dorafactory.org",
      website: "https://dorafactory.org",
    },
    chainId: "vota-ash",
    chainName: "Dora Vota",
    chainSymbolImageUrl:
      "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/vota-ash/chain.png",
    stakeCurrency: {
      coinDenom: "DORA",
      coinMinimalDenom: "peaka",
      coinDecimals: 18,
      coinGeckoId: "dora-factory-2",
      coinImageUrl:
        "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/vota-ash/peaka.png",
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "dora",
      bech32PrefixAccPub: "dorapub",
      bech32PrefixValAddr: "doravaloper",
      bech32PrefixValPub: "doravaloperpub",
      bech32PrefixConsAddr: "doravalcons",
      bech32PrefixConsPub: "doravalconspub",
    },
    currencies: [
      {
        coinDenom: "DORA",
        coinMinimalDenom: "peaka",
        coinDecimals: 18,
        coinGeckoId: "dora-factory-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/vota-ash/peaka.png",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "DORA",
        coinMinimalDenom: "peaka",
        coinDecimals: 18,
        coinGeckoId: "dora-factory-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/vota-ash/peaka.png",
        gasPriceStep: {
          low: 100000000000,
          average: 100000000000,
          high: 100000000000,
        },
      },
    ],
    features: [],
  },
};
