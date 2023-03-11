import got from 'got';
import httpStatus from 'http-status';
import config from '../config/config';
import ApiError from './ApiError';

export interface ICardanoAmount {
  unit: 'lovelace' | 'ada';
  quantity: string;
}

export interface ICardanoTransaction {
  hash: string;
  block: string;
  block_height: number;
  block_time: number;
  slot: number;
  index: number;
  output_amount: ICardanoAmount[];
  fees: string;
  deposit: string;
  size: number;
  invalid_before: null | string | undefined;
  invalid_hereafter: null | string | undefined;
  utxo_count: number;
  withdrawal_count: number;
  mir_cert_count: number;
  delegation_count: number;
  stake_cert_count: number;
  pool_update_count: number;
  pool_retire_count: number;
  asset_mint_or_burn_count: number;
  redeemer_count: number;
  valid_contract: boolean;
}

export interface IPocreCardanoTransaction extends ICardanoTransaction {
  metadata: any; // [IMPORTANT]: we need to define a metadata structure that would work for all pocre entities
}

export interface ICardanoBlock {
  time: number;
  height: number;
  hash: string;
  slot: number;
  epoch: number;
  epoch_slot: number;
  slot_leader: string;
  size: number;
  tx_count: number;
  output: string;
  fees: string;
  block_vrf: string;
  op_cert: string;
  op_cert_counter: string;
  previous_block: string;
  next_block: string;
  confirmations: number;
}

/**
 * A simple http layer to query blockfrost
 * @param {string} endpoint - the endpoint to hit
 */
const queryBlockfrost = async (endpoint: string) => {
  const response = await got.get(`${config.blockfrost.base_api_url}/${endpoint}`, {
    headers: {
      project_id: config.blockfrost.project_id,
    },
  });

  return JSON.parse(response.body);
};

/**
 * Gets block info from cardano blockchain
 * @param {string} blockHash - the hash of block
 * @returns {Promise<ICardanoBlock|undefined>} - cardano block info
 */
export const getBlockInfo = async (blockHash: string): Promise<ICardanoBlock | undefined> => {
  const { blockfrost } = config;

  try {
    const response = await queryBlockfrost(`${blockfrost.endpoints.blocks}/${blockHash}`);
    return response as ICardanoBlock;
  } catch {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `failed to get block info`);
  }
};

/**
 * Gets transaction info from cardano blockchain
 * @param {string} transactionHash - the hash of transaction
 * @returns {Promise<IPocreCardanoTransaction|undefined>} - cardano transaction info with pocre metadata
 */
export const getTransactionInfo = async (transactionHash: string): Promise<IPocreCardanoTransaction | undefined> => {
  const { blockfrost } = config;

  try {
    const txEndpoint = `${blockfrost.endpoints.transactions}/${transactionHash}`;
    const responseTx = await queryBlockfrost(txEndpoint);
    const responseMetaData = await queryBlockfrost(`${txEndpoint}/metadata`);

    // merge metadata and transaction info
    const mergedResponse = {
      ...responseTx,
      metadata: responseMetaData?.[0]?.json_metadata || null,
    };

    return mergedResponse as IPocreCardanoTransaction;
  } catch {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, `failed to get transaction info`);
  }
};
