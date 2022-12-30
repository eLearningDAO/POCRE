import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Litigation } from 'api/requests';
import moment from 'moment';
import { useState } from 'react';
import authUser from 'utils/helpers/authUser';

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

      // calculate open/closed and in progress litigations
      litigationResponse = {
        closed: litigationResponse?.results?.filter(
          (x) => moment(x.litigation_end).isBefore(new Date().toISOString()) || x.reconcilate,
        ),
        opening: [
          ...litigationResponse?.results?.filter(
            (x) => moment(x.litigation_start).isAfter(new Date().toISOString()),
          ) || [],
          ...litigationResponse?.results?.filter(
            (x) => moment(x.litigation_start).isBefore(new Date().toISOString())
              && moment(x.litigation_end).isAfter(new Date().toISOString())
              && x?.issuer?.user_id === user?.user_id && !x.reconcilate && !x.toJudge,
          ) || [],
        ],
        openedAgainstMe: litigationResponse?.results?.filter(
          (x) => moment(x.litigation_start).isBefore(new Date().toISOString())
            && moment(x.litigation_end).isAfter(new Date().toISOString())
            && x?.assumed_author?.user_id === user?.user_id && !x.reconcilate && !x.toJudge,
        ),
        toJudge: litigationResponse?.results?.filter(
          (x) => moment(x.litigation_start).isBefore(new Date().toISOString())
            && moment(x.litigation_end).isAfter(new Date().toISOString())
            && !x.reconcilate && x.toJudge,
        ),
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

  // update reconcilation status
  const {
    mutate: updateReconcilateStatus,
    isError: isReconcilateStatusUpdationError,
    isSuccess: isReconcilateStatusUpdated,
    isLoading: isUpdatingReconcilateStatus,
    reset: resetReconcilateStatus,
  } = useMutation({
    mutationFn: async (
      {
        id,
        reconcilate,
      },
    ) => {
      // make api call to update the litigation
      await Litigation.update(id, { reconcilate });

      // update litigation
      const updatedLitigations = { ...litigations };
      const foundLitigation = updatedLitigations?.openedAgainstMe?.find(
        (x) => x.litigation_id === id,
      );
      foundLitigation.reconcilate = reconcilate;
      if (reconcilate) {
        // update ownership status
        foundLitigation.ownership_transferred = true;

        // remove from opened
        updatedLitigations.openedAgainstMe = [
          ...updatedLitigations.openedAgainstMe,
        ].filter((x) => !x.reconcilate);

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
      // make api call to edit the litigation
      await Litigation.update(id, { ownership_transferred: true });

      // update litigation
      const updatedLitigations = { ...litigations };
      const foundLitigation = updatedLitigations?.closed?.find(
        (x) => x.litigation_id === id,
      );
      foundLitigation.ownership_transferred = true;

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
    isUpdatingReconcilateStatus,
    updatedReconcilateStatus: {
      success: isReconcilateStatusUpdated,
      error: isReconcilateStatusUpdationError ? 'Failed to update litigation status' : null,
    },
    updateReconcilateStatus,
    resetReconcilateStatus,
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
