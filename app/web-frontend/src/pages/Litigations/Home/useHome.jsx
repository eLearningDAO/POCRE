import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Litigation } from 'api/requests';
import moment from 'moment';
import { useState } from 'react';
import statusTypes from 'utils/constants/statusTypes';
import authUser from 'utils/helpers/authUser';
import { transactADAToPOCRE } from 'utils/helpers/wallet';
import { CHARGES, TRANSACTION_PURPOSES } from 'config';

const user = authUser.getUser();

const formatDates = (litigations) => litigations.map((x) => ({
  ...x,
  litigation_start: moment(x?.litigation_start).format('DD/MM/YYYY'), // moment auto converts utc to local time
  litigation_end: moment(x?.litigation_end).format('DD/MM/YYYY'), // moment auto converts utc to local time
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

      // getting the current date without timestamp, as the litigation start/end dates also have
      // dates without timestamps
      const isoDateToday = `${moment().format('YYYY-MM-DDT00:00:00.000')}Z`;

      // calculate open/closed and in progress litigations
      litigationResponse = {
        // display all closed litigations in which the auth user is a judge, issuer or claimer
        closed: litigationResponse?.results?.filter(
          (x) => (
            moment(x.litigation_end).isBefore(isoDateToday)
            // NOTE: [TEMP FIX]
            // if the original author does not do something in reconcilation phase then
            // the litigations status is pending
            // && x.litigation_status === statusTypes.STARTED
          )
            || x.litigation_status === statusTypes.WITHDRAWN,
        ),
        ...((() => {
          // gives all litigations that are currently started or pending to start (end
          // date has not reached)
          const litigationsOpenedOrOpeningByDate = [...litigationResponse?.results?.filter(
            (x) => moment(x?.litigation_end).isAfter(isoDateToday),
          ) || []];

          // gives all litigations that are currently started (start date has passed or is today
          // and end date has not reached)
          const litigationsOpenedByDate = [...litigationsOpenedOrOpeningByDate?.filter(
            (x) => moment(x?.litigation_start).isSameOrBefore(isoDateToday),
          ) || []];

          // gives all litigations that are in started status (pending and started status are
          // both treated as started, pending status is only used for the assumed author)
          const getStartedLitigationsByStatus = (allLitigations) => allLitigations.filter((x) => (
            (
              x?.litigation_status === statusTypes.PENDING
              || x?.litigation_status === statusTypes.STARTED
            )
            && !x.toJudge
          ));

          // gives all litigations that are started for non judges
          // eslint-disable-next-line max-len
          const openedForNonJudges = getStartedLitigationsByStatus(litigationsOpenedByDate);

          // gives all litigations that are opened or to be opened for non judges
          // eslint-disable-next-line max-len
          const openedOrOpeningForNonJudges = getStartedLitigationsByStatus(litigationsOpenedOrOpeningByDate);

          // gives all litigations that are in pending status for judges and have not ended
          const litigationsPendingToJudge = [...litigationResponse?.results?.filter(
            (x) => moment(x?.litigation_end).isAfter(isoDateToday)
              && x?.litigation_status === statusTypes.PENDING && x?.toJudge,
          ) || []];

          // gives all litigations that are in started status for judges
          const litigationsCurrentlyToJudge = litigationsOpenedByDate.filter((x) => (
            x?.litigation_status === statusTypes.STARTED && x?.toJudge
          ));

          return {
            openedAgainstMe: [
              ...openedForNonJudges.filter(
                (x) => x?.assumed_author?.user_id === user?.user_id,
              ),
            ],
            opening: [
              ...openedOrOpeningForNonJudges.filter(
                (x) => x?.issuer?.user_id === user?.user_id,
              ),
              ...litigationsPendingToJudge,
            ],
            toJudge: [...litigationsCurrentlyToJudge],
          };
        })()),
      };

      // convert litigation utc dates
      litigationResponse = {
        closed: formatDates(litigationResponse?.closed),
        opening: formatDates(litigationResponse?.opening),
        openedAgainstMe: formatDates(litigationResponse?.openedAgainstMe),
        toJudge: formatDates(litigationResponse?.toJudge),
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
      await Litigation.update(id, { litigation_status: litigationStatus });

      // update litigation
      const updatedLitigations = { ...litigations };
      const foundLitigation = updatedLitigations?.openedAgainstMe?.find(
        (x) => x.litigation_id === id,
      );
      foundLitigation.litigation_status = litigationStatus;
      if (litigationStatus === statusTypes.WITHDRAWN) {
        // update ownership status
        foundLitigation.ownership_transferred = true;

        // remove from opened
        updatedLitigations.openedAgainstMe = [
          ...updatedLitigations.openedAgainstMe,
        ].filter((x) => x.litigation_status === statusTypes.PENDING
          || x.litigation_status === statusTypes.STARTED);

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
