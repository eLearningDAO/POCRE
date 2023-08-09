import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Litigation, Transaction } from 'api/requests';
import { CHARGES } from 'config';
import { useLitigationsContext } from 'hydraDemo/contexts/LitigationsContext';
import moment from 'moment';
import { useEffect, useState } from 'react';
import statusTypes from 'utils/constants/statusTypes';
import transactionPurposes from 'utils/constants/transactionPurposes';
import authUser from 'utils/helpers/authUser';
import { transactADAToPOCRE } from 'utils/helpers/wallet';

const toDate = (dateString) => new Date(dateString);

const formatDates = (litigation) => ({
  ...litigation,
  reconcilation_start: moment(litigation?.reconcilation_start).format('DD/MM/YYYY'), // moment auto converts utc to local time
  reconcilation_end: moment(litigation?.reconcilation_end).format('DD/MM/YYYY'), // moment auto converts utc to local time
  voting_start: moment(litigation?.voting_start).format('DD/MM/YYYY'), // moment auto converts utc to local time
  voting_end: moment(litigation?.voting_end).format('DD/MM/YYYY'), // moment auto converts utc to local time
});

const useHome = () => {
  const { litigations } = useLitigationsContext();
  const queryClient = useQueryClient();
  const [shouldFetchLitigations, setShouldFetchLitigations] = useState(false);
  const user = authUser.getUser();

  // update assumed author response
  const {
    mutate: updateAssumedAuthorResponse,
    isError: isUpdateAssumedAuthorResponseError,
    isSuccess: isAssumedAuthorResponseUpdated,
    isLoading: isUpdatingAssumedAuthorResponse,
    reset: resetAssumedAuthorResponseStatus,
  } = useMutation({
    mutationFn: async (
      {
        id,
        assumedAuthorResponse,
      },
    ) => {
      // get transaction if we need one
      const transaction = await (async () => {
        if (assumedAuthorResponse !== statusTypes.START_LITIGATION) return null;

        // make transaction
        const txHash = await transactADAToPOCRE({
          amountADA: CHARGES.LITIGATION.START,
          walletName: authUser.getUser()?.selectedWallet,
          metaData: {
            pocre_id: id,
            pocre_entity: 'litigation',
            purpose: transactionPurposes.START_LITIGATION,
          },
        });
        if (!txHash) throw new Error('Failed to make transaction');

        // make pocre transaction to store this info
        return await await Transaction.create({
          transaction_hash: txHash,
          transaction_purpose: transactionPurposes.START_LITIGATION,
        });
      })();

      // make api call to respond to the litigation
      await Litigation.respond(id, {
        assumed_author_response: assumedAuthorResponse,
        ...(transaction && { transaction_id: transaction.transaction_id }),
      });

      // get populated data
      const toPopulate = [
        'assumed_author', 'winner', 'issuer_id', 'creation_id', 'creation_id.author_id', 'decisions',
        'recognitions.recognition_for', 'material_id.author_id', 'material_id.author_id', 'transactions',
      ];
      let updatedLitigationResponse = await Litigation.getById(id, toPopulate.map((x) => `populate=${x}`).join('&'));
      updatedLitigationResponse = formatDates(updatedLitigationResponse);

      // update litigation
      const updatedLitigations = { ...litigations };

      // update this litigation in cache
      const foundLitigation = litigations.inReconcilation.find((x) => x?.litigation_id === id);
      foundLitigation.transactions = updatedLitigationResponse.transactions;

      if (assumedAuthorResponse === statusTypes.WITHDRAW_CLAIM) {
        // add updated litigation closed key
        updatedLitigations.closed = [
          updatedLitigationResponse,
          ...updatedLitigations.closed,
        ];
      }

      // update queries
      queryClient.cancelQueries({ queryKey: ['litigations'] });
      queryClient.setQueryData(['litigations'], () => ({ ...updatedLitigations }));
    },
  });

  // transfer litigation ownership
  const {
    mutate: transferLitigatedItemOwnership,
    isError: isTransferOwnershipError,
    isSuccess: isTransferOwnershipSuccess,
    isLoading: isTransferringOwnership,
    reset: resetTransferOwnershipStatus,
  } = useMutation({
    mutationFn: async (id) => {
      // update litigation
      const updatedLitigations = { ...litigations };
      const foundLitigation = updatedLitigations?.closed?.find(
        (x) => x?.litigation_id === id,
      );
      foundLitigation.ownership_transferred = true;

      // make transaction
      const txHash = await transactADAToPOCRE({
        amountADA: CHARGES.LITIGATION.REDEEM,
        walletName: authUser.getUser()?.selectedWallet,
        metaData: {
          pocre_id: id,
          pocre_entity: 'litigation',
          purpose: transactionPurposes.REDEEM_LITIGATED_ITEM,
        },
      });
      if (!txHash) throw new Error('Failed to make transaction');

      // make pocre transaction to store this info
      const transaction = await Transaction.create({
        transaction_hash: txHash,
        transaction_purpose: transactionPurposes.REDEEM_LITIGATED_ITEM,
      });

      // make api call to claim the litigated item ownership
      await Litigation.claimOwnership(id, { transaction_id: transaction.transaction_id });

      // update queries
      queryClient.cancelQueries({ queryKey: ['litigations'] });
      queryClient.setQueryData(['litigations'], () => ({ ...updatedLitigations }));
    },
  });

  return {
    // fetch
    isFetchingLitigations: false,
    fetchLitigationsStatus: {
      success: true,
      error: null,
    },
    litigations,
    fetchLitigations: () => setShouldFetchLitigations(true),
    // update status
    isUpdatingAssumedAuthorResponse,
    updatedAssumedAuthorResponseStatus: {
      success: isAssumedAuthorResponseUpdated,
      error: isUpdateAssumedAuthorResponseError ? 'Failed to update litigation status' : null,
    },
    updateAssumedAuthorResponse,
    resetAssumedAuthorResponseStatus,
    // transfer ownership
    isTransferringOwnership,
    transferOwnershipStatus: {
      success: isTransferOwnershipSuccess,
      error: isTransferOwnershipError ? 'Failed to transfer litigated item ownership!' : null,
    },
    resetTransferOwnershipStatus,
    transferLitigatedItemOwnership,
  };
};

export default useHome;
