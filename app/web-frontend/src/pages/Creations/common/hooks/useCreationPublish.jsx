import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IPFS_BASE_URL, CHARGES, TRANSACTION_PURPOSES } from 'config';
import authUser from 'utils/helpers/authUser';
import { transactADAToPOCRE } from 'utils/helpers/wallet';
import { Creation } from 'api/requests';

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
      // make transaction
      const txHash = await transactADAToPOCRE({
        amountADA: CHARGES.CREATION_PUBLISHING_ADA,
        purposeDesc: TRANSACTION_PURPOSES.CREATION_PUBLISHING,
        walletName: authUser.getUser()?.selectedWallet,
        metaData: {
          ipfsHash,
          ipfsURL: IPFS_BASE_URL,
        },
      });

      // update in db
      if (txHash) await Creation.storePublishStatus(id);

      // update queries
      queryClient.cancelQueries({ queryKey: ['creations'] });
      queryClient.setQueryData(['creations'], (data) => {
        if (data && data.results) {
          const temporaryCreations = data.results;

          const foundCreation = temporaryCreations.find((x) => x.creation_id === id);
          if (foundCreation) foundCreation.is_onchain = true;

          return { ...data, results: [...temporaryCreations] };
        }
        return data;
      });
      queryClient.setQueryData([`creations-${id}`], (data) => {
        if (data && data?.creation_id) {
          return { ...data, is_onchain: true };
        }
        return data;
      });
    },
  });

  return {
    publishCreationStatus: {
      success: isPublishSuccess ? 'Creation published successfully!' : null,
      error: isPublishError ? error?.message || 'Failed to publish creation' : null,
    },
    publishCreation,
    resetPublishErrors,
    isPublishingCreation,
  };
};

export default usePublish;
