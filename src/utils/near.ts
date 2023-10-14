import {
  Account,
  connect,
  Contract,
  keyStores,
  Near,
  utils,
} from "near-api-js";
import { KeyStore } from "near-api-js/lib/key_stores";
import os from "os";
import path from "path";
import { config } from "./helper";

let near: Near;
const accounts: Record<string, Account> = {};
const contracts: { [id: string]: Contract } = {};

async function init(accountId: string) {
  if (accounts[accountId]) return;

  const networkId = config.near.networkId;

  let keyStore: KeyStore;
  if (process.env.PRIVATE_KEY) {
    const keyPair = utils.KeyPair.fromString(process.env.PRIVATE_KEY);
    const memoryKeyStore = new keyStores.InMemoryKeyStore();
    memoryKeyStore.setKey(networkId, accountId, keyPair);

    keyStore = memoryKeyStore;
  } else {
    const homedir = os.homedir();
    const CREDENTIALS_DIR = ".near-credentials";
    const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
    const fileKeyStore = new keyStores.UnencryptedFileSystemKeyStore(
      credentialsPath
    );

    keyStore = fileKeyStore;
  }

  const nearConfig: any = Object.assign(config.near, { keyStore });

  near = await connect(nearConfig);
  accounts[accountId] = await near.account(accountId);
}

export async function getNear(accountId: string) {
  await init(accountId);
  return near;
}

export async function getAccount(accountId: string) {
  await init(accountId);
  return accounts[accountId];
}

export async function getNearContract(
  contractId: string,
  accountId: string,
  viewMethods: string[],
  changeMethods: string[] = []
): Promise<Contract> {
  if (!contracts[contractId]) {
    const account = await getAccount(accountId);
    contracts[contractId] = new Contract(account, contractId, {
      viewMethods,
      changeMethods,
    });
  }

  return contracts[contractId];
}
