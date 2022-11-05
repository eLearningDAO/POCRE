import Cookies from 'js-cookie';
import moment from 'moment';
import { useCallback, useState } from 'react';
import { Litigation } from 'api/requests';

const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

const useHome = () => {
  const [isFetchingLitigations, setIsFetchingLitigations] = useState(false);
  const [isUpdatingReconcilateStatus, setIsUpdatingReconcilateStatus] = useState(false);
  const [isTransferringOwnership, setIsTransferringOwnership] = useState(false);
  const [litigations, setLitigations] = useState({
    opening: [],
    closed: [],
    openedAgainstMe: [],
    toJudge: [],
  });
  const [fetchLitigationsStatus, setFetchLitigationsStatus] = useState({
    success: false,
    error: null,
  });
  const [updatedReconcilateStatus, setUpdatedReconcilateStatus] = useState({
    success: false,
    error: null,
  });
  const [transferOwnershipStatus, setTransferOwnershipStatus] = useState({
    success: false,
    error: null,
  });

  const fetchLitigations = useCallback(async () => {
    try {
      setIsFetchingLitigations(true);

      // get litigations
      const toPopulate = [
        'assumed_author',
        'winner',
        'issuer_id',
        'creation_id',
        'creation_id.author_id',
        'decisions',
        'invitations.invite_to',
        'invitations.status_id',
        'material_id.author_id',
        'material_id.author_id',
      ];
      let litigationResponse = await Litigation.getAll(
        `query=${authUser?.user_id}&search_fields[]=issuer_id&search_fields[]=assumed_author&page=${1}&limit=1000&${toPopulate.map((x) => `populate=${x}`).join('&')}`,
      );

      // get litigations to judge
      const litigationToJudgeResponse = await Litigation.getAll(
        `judged_by=${authUser?.user_id}&limit=1000&${toPopulate.map((x) => `populate=${x}`).join('&')}`,
      );

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
              && x?.issuer?.user_id === authUser?.user_id && !x.reconcilate && !x.toJudge,
          ) || [],
        ],
        openedAgainstMe: litigationResponse?.results?.filter(
          (x) => moment(x.litigation_start).isBefore(new Date().toISOString())
            && moment(x.litigation_end).isAfter(new Date().toISOString())
            && x?.assumed_author?.user_id === authUser?.user_id && !x.reconcilate && !x.toJudge,
        ),
        toJudge: litigationResponse?.results?.filter(
          (x) => moment(x.litigation_start).isBefore(new Date().toISOString())
            && moment(x.litigation_end).isAfter(new Date().toISOString())
            && !x.reconcilate && x.toJudge,
        ),
      };

      setFetchLitigationsStatus({
        success: true,
        error: null,
      });
      setLitigations({ ...litigationResponse });
      // eslint-disable-next-line sonarjs/no-identical-functions
      setTimeout(() => setFetchLitigationsStatus({
        success: false,
        error: null,
      }), 3000);
    } catch {
      setFetchLitigationsStatus({
        success: false,
        error: 'Failed to fetch litigations',
      });
    } finally {
      setIsFetchingLitigations(false);
    }
  }, []);

  const updateReconcilateStatus = useCallback(async (id, reconcilate) => {
    try {
      setIsUpdatingReconcilateStatus(true);

      // make api call to update the litigation
      await Litigation.update(id, { reconcilate });

      // update litigation
      const updatedLitigations = { ...litigations };
      const foundLitigation = updatedLitigations?.results?.openedAgainstMe?.find(
        (x) => x.litigation_id === id,
      );
      foundLitigation.reconcilate = reconcilate;
      if (reconcilate) {
        // update ownership status
        foundLitigation.ownership_transferred = true;

        // remove from opened
        updatedLitigations.results.openedAgainstMe = [
          ...updatedLitigations.results.openedAgainstMe,
        ].filter((x) => !x.reconcilate);

        // add to closed
        updatedLitigations.results.closed = [
          ...updatedLitigations.results.closed,
          { ...foundLitigation },
        ];
      }

      setUpdatedReconcilateStatus({
        success: true,
        error: null,
      });
      setLitigations({ ...updatedLitigations });
      setTimeout(() => setUpdatedReconcilateStatus({
        success: false,
        error: null,
      }), 3000);
    } catch {
      setUpdatedReconcilateStatus({
        success: false,
        error: 'Failed to update litigation status',
      });
    } finally {
      setIsUpdatingReconcilateStatus(false);
    }
  }, [litigations]);

  const transferLitigatedItemOwnership = useCallback(async (id) => {
    try {
      setIsTransferringOwnership(true);

      // make api call to edit the litigation
      await Litigation.update(id, { ownership_transferred: true });

      // update litigation
      const updatedLitigations = { ...litigations };
      const foundLitigation = updatedLitigations?.results?.closed?.find(
        (x) => x.litigation_id === id,
      );
      foundLitigation.ownership_transferred = true;

      setTransferOwnershipStatus({
        success: true,
        error: null,
      });
      setLitigations({ ...updatedLitigations });
      setTimeout(() => setTransferOwnershipStatus({
        success: false,
        error: null,
      }), 3000);
    } catch {
      setTransferOwnershipStatus({
        success: false,
        error: 'Failed to transfer litigated item ownership!',
      });
    } finally {
      setIsTransferringOwnership(false);
    }
  }, [litigations]);

  return {
    isFetchingLitigations,
    isTransferringOwnership,
    isUpdatingReconcilateStatus,
    fetchLitigationsStatus,
    transferOwnershipStatus,
    setTransferOwnershipStatus,
    updatedReconcilateStatus,
    setUpdatedReconcilateStatus,
    litigations,
    fetchLitigations,
    transferLitigatedItemOwnership,
    updateReconcilateStatus,
  };
};

export default useHome;
