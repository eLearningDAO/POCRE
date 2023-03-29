import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Litigation, Transaction } from 'api/requests';
import { CHARGES } from 'config';
import moment from 'moment';
import { useState } from 'react';
import statusTypes from 'utils/constants/statusTypes';
import transactionPurposes from 'utils/constants/transactionPurposes';
import authUser from 'utils/helpers/authUser';
import { transactADAToPOCRE } from 'utils/helpers/wallet';

const user = authUser.getUser();

const toDate = (dateString) => new Date(dateString);

const formatDates = (litigation) => ({
  ...litigation,
  reconcilation_start: moment(litigation?.reconcilation_start).format('DD/MM/YYYY'), // moment auto converts utc to local time
  reconcilation_end: moment(litigation?.reconcilation_end).format('DD/MM/YYYY'), // moment auto converts utc to local time
  voting_start: moment(litigation?.voting_start).format('DD/MM/YYYY'), // moment auto converts utc to local time
  voting_end: moment(litigation?.voting_end).format('DD/MM/YYYY'), // moment auto converts utc to local time
});

const useHome = () => {
  const queryClient = useQueryClient();
  const [shouldFetchLitigations, setShouldFetchLitigations] = useState(false);

  // fetch all litigations
  const {
    data: litigations,
    isError: isFetchLitigationsSuccess,
    isSuccess: isFetchLitigationsError,
    isLoading: isFetchingLitigations,
  } = useQuery({
    queryKey: ['litigations'],
    queryFn: async () => {
      const toPopulate = [
        'assumed_author', 'winner', 'issuer_id', 'creation_id', 'creation_id.author_id', 'decisions', 'material_id.author_id',
      ];

      // get all litigations
      let litigationResponse = await Litigation.getAll(
        `query=${user?.user_id}&search_fields[]=issuer_id&search_fields[]=assumed_author&page=${1}&limit=1000&${toPopulate.map((x) => `populate=${x}`).join('&')}`,
      );

      // get litigations to judge
      const litigationToJudgeResponse = await Litigation.getAll(
        `judged_by=${user?.user_id}&limit=1000&${toPopulate.map((x) => `populate=${x}`).join('&')}`,
      );

      // merge results
      litigationResponse.results = [
        ...litigationResponse.results,
        ...(litigationToJudgeResponse?.results?.map((x) => ({ ...x, toJudge: true })) || []),
      ];

      const now = moment();

      // calculate open/closed and in progress litigations
      litigationResponse = {
        inDraft: litigationResponse?.results?.filter((x) => x.is_draft),
        // displayed to assumed authors and claimers
        inReconcilation: litigationResponse?.results?.filter(
          (x) => (
            moment(toDate(x?.reconcilation_start)).isBefore(now)
            && moment(toDate(x?.reconcilation_end)).isAfter(now)
            && x?.assumed_author_response === statusTypes.PENDING_RESPONSE
            && !x.is_draft
          ),
        ),
        // displayed to assumed authors and claimers
        inVoting: litigationResponse?.results?.filter(
          (x) => (
            moment(toDate(x?.voting_start)).isBefore(now)
            && moment(toDate(x?.voting_end)).isAfter(now)
            && x?.assumed_author_response === statusTypes.START_LITIGATION
            && !x?.toJudge
            && !x.is_draft
          ),
        ),
        // displayed to jury members only
        toVote: litigationResponse?.results?.filter(
          (x) => (
            moment(toDate(x?.voting_start)).isBefore(now)
            && moment(toDate(x?.voting_end)).isAfter(now)
            && x?.assumed_author_response === statusTypes.START_LITIGATION
            && x?.toJudge
            && !x.is_draft
          ),
        ),
        // displayed to all users
        closed: litigationResponse?.results?.filter(
          (x) => (
            !x.is_draft
            && (
              moment(toDate(x?.voting_end)).isBefore(now)
              || x?.assumed_author_response === statusTypes.WITHDRAW_CLAIM
              || (
                // no response from author in reconilation phase (author lost claim)
                moment(toDate(x?.reconcilation_end)).isBefore(now)
                && x?.assumed_author_response === statusTypes.PENDING_RESPONSE
              )
            )
          ),
        ),
      };

      // convert litigation utc dates
      litigationResponse = {
        inDraft: litigationResponse?.inDraft?.map((x) => formatDates(x)),
        inReconcilation: litigationResponse?.inReconcilation?.map((x) => formatDates(x)),
        inVoting: litigationResponse?.inVoting?.map((x) => formatDates(x)),
        toVote: litigationResponse?.toVote?.map((x) => formatDates(x)),
        closed: litigationResponse?.closed?.map((x) => formatDates(x)),
      };

      return { ...litigationResponse };
    },
    staleTime: 100_000, // delete cached data after 100 seconds
    enabled: !!shouldFetchLitigations,
  });

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
      const transactionId = await (async () => {
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
        const transaction = await Transaction.create({
          transaction_hash: txHash,
          transaction_purpose: transactionPurposes.START_LITIGATION,
        });

        return transaction.transaction_id;
      })();

      // make api call to respond to the litigation
      await Litigation.respond(id, {
        assumed_author_response: assumedAuthorResponse,
        ...(transactionId && { transaction_id: transactionId }),
      });

      // get populated data
      const toPopulate = [
        'assumed_author', 'winner', 'issuer_id', 'creation_id', 'creation_id.author_id', 'decisions',
        'recognitions.recognition_for', 'material_id.author_id', 'material_id.author_id',
      ];
      let updatedLitigationResponse = await Litigation.getById(id, toPopulate.map((x) => `populate=${x}`).join('&'));
      updatedLitigationResponse = formatDates(updatedLitigationResponse);

      // update litigation
      const updatedLitigations = { ...litigations };

      // filter this litigation from inReconcilation key
      updatedLitigations.inReconcilation = [
        ...updatedLitigations.inReconcilation,
      ].filter((x) => x?.litigation_id !== id);

      if (assumedAuthorResponse === statusTypes.START_LITIGATION) {
        // add updated litigation inVoting key
        updatedLitigations.inVoting = [
          updatedLitigationResponse,
          ...updatedLitigations.inVoting,
        ];
      }

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
    isFetchingLitigations,
    fetchLitigationsStatus: {
      success: isFetchLitigationsSuccess,
      error: isFetchLitigationsError ? 'Failed to fetch litigations' : null,
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
