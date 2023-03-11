import { verifyWebhookSignature } from '@blockfrost/blockfrost-js';
import httpStatus from 'http-status';
import config from '../config/config';
import publishPlatforms from '../constants/publishPlatforms';
import transactionPurposes from '../constants/transactionPurposes';
import { getTransactionByHash, updateTransactionById } from '../services/transaction.service';
import ApiError from '../utils/ApiError';
import { getBlockInfo, getTransactionInfo, ICardanoTransaction } from '../utils/cardano';
import catchAsync from '../utils/catchAsync';
import { publishCreation } from './creation.controller';

export const processTransaction = catchAsync(async (req, res, next): Promise<void> => {
  try {
    // verify blockfrost webhook signature
    const isValidSignature = (() => {
      // check if signature is present
      const signatureHeader = req.headers['blockfrost-signature'];
      if (!signatureHeader) throw new Error(`signature header is required`);

      // check if signature is valid
      return verifyWebhookSignature(
        JSON.stringify(req.body), // [Note from blockfrost docs]: Stringified request.body (Note: In AWS Lambda you don't need to call JSON.stringify as event.body is already stringified)
        signatureHeader,
        config.blockfrost.webhook_token,
        600 // 600 seconds = 10 minutes - time tolerance for signature validity, if this webhook was older than 600 seconds its invalid
      );
    })();
    if (!isValidSignature) throw new Error(`invalid signature header`);

    // get transaction info
    const webhookPayload = req?.body?.payload?.[0]?.tx as ICardanoTransaction;
    const pocreTransaction = await getTransactionByHash(webhookPayload.hash, {
      populate: 'maker_id',
    });
    const cardanoTransation = await getTransactionInfo(webhookPayload.hash);
    const cardanoBlock = await getBlockInfo(cardanoTransation?.block as string);

    // validate if minimum amount of blocks are confirmed
    if (cardanoBlock && cardanoBlock.confirmations < config.crypto.valid_transaction.min_block_confirmations) {
      throw new Error(`minimum blocks not confirmed`);
    }

    // if transaction was for creation, then transform req and pass it to creations
    if (
      pocreTransaction &&
      (pocreTransaction.transaction_purpose === transactionPurposes.PUBLISH_CREATION ||
        pocreTransaction.transaction_purpose === transactionPurposes.FINALIZE_CREATION) &&
      cardanoTransation &&
      cardanoTransation.metadata.pocre_entity === 'creation'
    ) {
      // transform current request to glue with creation controller
      const transformedReq: any = {
        ...req,
        user: (pocreTransaction as any).maker,
        params: {
          creation_id: cardanoTransation.metadata.pocre_id,
        },
        body: {
          publish_on:
            pocreTransaction.transaction_purpose === transactionPurposes.PUBLISH_CREATION
              ? publishPlatforms.IPFS
              : publishPlatforms.BLOCKCHAIN,
        },
      };

      // publish the creation
      await publishCreation(transformedReq, res, next); // if this returns non truthy response, then webhook fails

      // confirm the transaction
      await updateTransactionById(pocreTransaction.transaction_id, {
        is_validated: true,
      });

      return;
    }

    res.status(httpStatus.NOT_IMPLEMENTED).send(`no operation performed by pocre`); // let the webhook know that pocre did not used this info
  } catch (e: unknown) {
    const error = e as Error;
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
});
