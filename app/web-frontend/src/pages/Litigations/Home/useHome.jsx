import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Litigation } from 'api/requests';
import { CHARGES, TRANSACTION_PURPOSES } from 'config';
import moment from 'moment';
import { useState } from 'react';
import statusTypes from 'utils/constants/statusTypes';
import authUser from 'utils/helpers/authUser';
import { transactADAToPOCRE } from 'utils/helpers/wallet';

const user = authUser.getUser();

const toDate = (dateString) => new Date(dateString);

const formatDates = (litigations) => litigations.map((x) => ({
  ...x,
  reconcilation_start: moment(x?.reconcilation_start).format('DD/MM/YYYY'), // moment auto converts utc to local time
  reconcilation_end: moment(x?.reconcilation_end).format('DD/MM/YYYY'), // moment auto converts utc to local time
  voting_start: moment(x?.voting_start).format('DD/MM/YYYY'), // moment auto converts utc to local time
  voting_end: moment(x?.voting_end).format('DD/MM/YYYY'), // moment auto converts utc to local time
}));

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
      // get litigations
      const toPopulate = [
        'assumed_author', 'winner', 'issuer_id', 'creation_id', 'creation_id.author_id', 'decisions',
        'recognitions.recognition_for', 'material_id.author_id', 'material_id.author_id',
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
        // displayed to assumed authors and claimers
        inReconcilation: litigationResponse?.results?.filter(
          (x) => (
            moment(toDate(x?.reconcilation_start)).isBefore(now)
            && moment(toDate(x?.reconcilation_end)).isAfter(now)
          ),
        ),
        // displayed to assumed authors and claimers
        inVoting: litigationResponse?.results?.filter(
          (x) => (
            moment(toDate(x?.voting_start)).isBefore(now)
            && moment(toDate(x?.voting_end)).isAfter(now)
          ),
        ),
        // displayed to jury members only
        toVote: litigationResponse?.results?.filter(
          (x) => (
            moment(toDate(x?.voting_start)).isBefore(now)
            && moment(toDate(x?.voting_end)).isAfter(now)
            && x.toJudge
          ),
        ),
        // displayed to all users
        closed: litigationResponse?.results?.filter(
          (x) => moment(toDate(x?.voting_end)).isBefore(now),
        ),
      };

      // convert litigation utc dates
      litigationResponse = {
        inReconcilation: formatDates(litigationResponse?.inReconcilation),
        inVoting: formatDates(litigationResponse?.inVoting),
        toVote: formatDates(litigationResponse?.toVote),
        closed: formatDates(litigationResponse?.closed),
      };

      return { ...litigationResponse };
    },
    staleTime: 100_000, // delete cached data after 100 seconds
    enabled: !!shouldFetchLitigations,
  });

  // update litigation status
  const {
    mutate: updateLitigationStatus,
    isError: isLitigationStatusUpdationError,
    isSuccess: isLitigationStatusUpdated,
    isLoading: isUpdatingLitigationStatus,
    reset: resetLitigationStatus,
  } = useMutation({
    mutationFn: async (
      {
        id,
        litigationStatus,
      },
    ) => {
      // make api call to update the litigation
      await Litigation.update(id, { assumed_author_response: litigationStatus });

      // update litigation
      const updatedLitigations = { ...litigations };
      const foundLitigation = updatedLitigations?.inReconcilation?.find(
        (x) => x.litigation_id === id,
      );
      foundLitigation.assumed_author_response = litigationStatus;
      if (litigationStatus === statusTypes.WITHDRAW_CLAIM) {
        // update ownership status
        foundLitigation.ownership_transferred = true;

        // remove from opened
        updatedLitigations.inReconcilation = [
          ...updatedLitigations.inReconcilation,
        ].filter((x) => x.assumed_author_response === statusTypes.PENDING_RESPONSE
          || x.assumed_author_response === statusTypes.START_LITIGATION);

        // add to closed
        updatedLitigations.closed = [
          ...updatedLitigations.closed,
          { ...foundLitigation },
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
        (x) => x.litigation_id === id,
      );
      foundLitigation.ownership_transferred = true;

      // make transaction
      const txHash = await transactADAToPOCRE({
        amountADA: CHARGES.LITIGATION.REDEEM,
        purposeDesc: TRANSACTION_PURPOSES.LITIGATION.REDEEM,
        walletName: authUser.getUser()?.selectedWallet,
        metaData: {
          redeemed_by: user?.user_id,
          litigation_id: foundLitigation.litigation_id,
          creation_id: foundLitigation.creation_id,
          material_id: foundLitigation.material_id,
        },
      });

      if (!txHash) throw new Error('Failed to make transaction');

      // make api call to edit the litigation
      await Litigation.update(id, { ownership_transferred: true });

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
    isUpdatingLitigationStatus,
    updatedLitigationStatus: {
      success: isLitigationStatusUpdated,
      error: isLitigationStatusUpdationError ? 'Failed to update litigation status' : null,
    },
    updateLitigationStatus,
    resetLitigationStatus,
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
