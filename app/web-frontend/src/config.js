const API_BASE_URL = 'https://pocre-api.herokuapp.com/v1/';

const POCRE_WALLET_ADDRESS = {
  MAINNET: 'addr_test1qr0nvz3xurstmkj3h3a32knxsgpzvz4g8z3lvhhya9ffzh74uhu2hd3kjx8v9p906g4sejyj3w7q76zqwsgt4w9drfnsp8jhz7',
  PREPROD: 'addr_test1qr0nvz3xurstmkj3h3a32knxsgpzvz4g8z3lvhhya9ffzh74uhu2hd3kjx8v9p906g4sejyj3w7q76zqwsgt4w9drfnsp8jhz7',
  PREVIEW: 'addr_test1qr0nvz3xurstmkj3h3a32knxsgpzvz4g8z3lvhhya9ffzh74uhu2hd3kjx8v9p906g4sejyj3w7q76zqwsgt4w9drfnsp8jhz7',
  TESTNET: 'addr_test1qr0nvz3xurstmkj3h3a32knxsgpzvz4g8z3lvhhya9ffzh74uhu2hd3kjx8v9p906g4sejyj3w7q76zqwsgt4w9drfnsp8jhz7',
};

const POCRE_NETWORKS = {
  MAINNET: 1,
  PREPROD: 0,
  PREVIEW: 0,
  TESTNET: 0,
};

// charges in ADA
const CHARGES = {
  CREATION: {
    PUBLISHING_ON_IPFS: 9,
    FINALIZING_ON_CHAIN: 1,
  },
  RECOGNITION_ACCEPT: 5,
  LITIGATION: {
    START: 10,
    VOTE: 1,
    REDEEM: 5,
  },
};

const TRANSACTION_PURPOSES = {
  CREATION: {
    PUBLISHING_ON_IPFS: 'CREATION_PENDING',
    FINALIZING_ON_CHAIN: 'CREATION_FINALIZED',
  },
  RECOGNITION_ACCEPT: 'RECOGNITION_ACCEPT',
  LITIGATION: {
    START: 'LITIGATION_START',
    VOTE: 'LITIGATION_VOTE',
    REDEEM: 'LITIGATED_ITEM_REDEEM',
  },
};

const IPFS_BASE_URL = 'https://gateway.pinata.cloud/ipfs/';

export {
  API_BASE_URL,
  POCRE_WALLET_ADDRESS,
  POCRE_NETWORKS,
  CHARGES,
  IPFS_BASE_URL,
  TRANSACTION_PURPOSES,
};
