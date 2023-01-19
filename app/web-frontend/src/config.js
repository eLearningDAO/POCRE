const API_BASE_URL = 'https://pocre-api.herokuapp.com/v1/';

const POCRE_WALLET_ADDRESS = 'addr_test1qr0nvz3xurstmkj3h3a32knxsgpzvz4g8z3lvhhya9ffzh74uhu2hd3kjx8v9p906g4sejyj3w7q76zqwsgt4w9drfnsp8jhz7'; // preview testnet address || IMPORTANT: dont make real transactions

const CHARGES = {
  CREATION: {
    PUBLISHING_ON_IPFS: 9,
    FINALIZING_ON_CHAIN: 1,
  },
};

const TRANSACTION_PURPOSES = {
  CREATION: {
    PUBLISHING_ON_IPFS: 'CREATION_PENDING',
    FINALIZING_ON_CHAIN: 'CREATION_FINALIZED',
  },
};

const IPFS_BASE_URL = 'https://gateway.pinata.cloud/ipfs/';

export {
  API_BASE_URL,
  POCRE_WALLET_ADDRESS,
  CHARGES,
  IPFS_BASE_URL,
  TRANSACTION_PURPOSES,
};
