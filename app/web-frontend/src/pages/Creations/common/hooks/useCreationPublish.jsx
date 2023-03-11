import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Creation, Transaction } from 'api/requests';
import { CHARGES, IPFS_BASE_URL } from 'config';
import transactionPurposes from 'utils/constants/transactionPurposes';
import authUser from 'utils/helpers/authUser';
import { transactADAToPOCRE } from 'utils/helpers/wallet';

const usePublish = () => {
  const queryClient = useQueryClient();

  // publish creation
  const {
    mutate: publishCreation,
    isError: isPublishError,
    isSuccess: isPublishSuccess,
    isLoading: isPublishingCreation,
    error,
    reset: resetPublishErrors,
  } = useMutation({
    mutationFn: async ({ id, ipfsHash }) => {
      // make crypto transaction
      const txHash = await transactADAToPOCRE({
        amountADA: CHARGES.CREATION.FINALIZING_ON_CHAIN,
        walletName: authUser.getUser()?.selectedWallet,
        metaData: {
          ipfsHash,
          ipfsURL: IPFS_BASE_URL,
          pocre_id: id,
          pocre_entity: 'creation',
          purpose: transactionPurposes.FINALIZE_CREATION,
        },
      });
      if (!txHash) throw new Error('Failed to make transaction');

      // make pocre transaction to store this info
      const transaction = await Transaction.create({
        transaction_hash: txHash,
        transaction_purpose: transactionPurposes.FINALIZE_CREATION,
      });

      // register pocre transaction for creation
      await Creation.registerTransaction(id, {
        transaction_id: transaction.transaction_id,
      });

      // update queries
      queryClient.cancelQueries({ queryKey: ['creations'] });
      queryClient.invalidateQueries({ queryKey: ['creations'] });
      queryClient.invalidateQueries({ queryKey: [`creations-${id}`] });
    },
  });

  return {
    publishCreationStatus: {
      success: isPublishSuccess ? 'Payment successful!' : null,
      error: isPublishError ? error?.message || 'Failed to publish creation' : null,
    },
    publishCreation,
    resetPublishErrors,
    isPublishingCreation,
  };
};

export default usePublish;
