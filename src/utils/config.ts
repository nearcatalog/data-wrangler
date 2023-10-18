import { keyStores } from "near-api-js";
import { NearConfig } from "near-api-js/lib/near";

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Network = "mainnet" | "testnet";

interface SubgraphConfig {
  apiUrl: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  pool: {
    max: number;
    min: number;
    idle: number;
  };
  dialectOptions?: object;
}

export interface Config {
  near: NearConfig;
  subgraph: SubgraphConfig;
  nearSocialContractId: string;
  awesomeBosAccountId: string;
  legacyAwesomeNearAccountId: string;
  nearHorizonContractId: string;
  database: {
    nearIndexer: DatabaseConfig;
    legacyAwesomeNEAR?: DatabaseConfig;
  };
}

const keyStore = new keyStores.InMemoryKeyStore();

const configs: Record<Network, Config> = {
  mainnet: {
    near: {
      networkId: "mainnet",
      keyStore, // optional if not signing transactions
      nodeUrl:
        process.env.NEAR_CLI_MAINNET_RPC_SERVER_URL ||
        "https://rpc.mainnet.near.org",
      walletUrl: "https://wallet.near.org",
      helperUrl: "https://helper.near.org",
    },
    subgraph: {
      apiUrl: "https://api.thegraph.com/subgraphs/name/awesome-bos/near-social",
    },
    nearSocialContractId: "social.near",
    awesomeBosAccountId: "awesomebos.near",
    legacyAwesomeNearAccountId: "legacy-awesome.near",
    nearHorizonContractId: "nearhorizon.near",
    database: {
      nearIndexer: {
        host: "mainnet.db.explorer.indexer.near.dev",
        port: 5432,
        username: "public_readonly",
        password: "nearprotocol",
        database: "mainnet_explorer",
        pool: {
          max: 5,
          min: 0,
          idle: 10000,
        },
      },
      legacyAwesomeNEAR: {
        host: "localhost",
        port: 5432,
        username: "public_readonly",
        password: "nearprotocol",
        database: "mainnet_explorer",
        pool: {
          max: 5,
          min: 0,
          idle: 10000,
        },
      },
    },
  },
  testnet: {
    near: {
      networkId: "testnet",
      keyStore, // optional if not signing transactions
      nodeUrl:
        process.env.NEAR_CLI_TESTNET_RPC_SERVER_URL ||
        "https://rpc.testnet.near.org",
      walletUrl: "https://wallet.testnet.near.org",
      helperUrl: "https://helper.testnet.near.org",
    },
    subgraph: {
      apiUrl:
        "https://api.thegraph.com/subgraphs/name/awesome-bos/near-social-testnet",
    },
    nearSocialContractId: "v1.social08.testnet",
    awesomeBosAccountId: "awesomebos.testnet",
    legacyAwesomeNearAccountId: "legacy-awesome.testnet",
    nearHorizonContractId: "nearhorizon.testnet",
    database: {
      nearIndexer: {
        host: "testnet.db.explorer.indexer.near.dev",
        port: 5432,
        username: "public_readonly",
        password: "nearprotocol",
        database: "testnet_explorer",
        pool: {
          max: 5,
          min: 0,
          idle: 10000,
        },
      },
    },
  },
};

export function getConfig(network: Network): Config {
  return configs[network];
}
