import Cookies from 'js-cookie';
import moment from 'moment';
import { useCallback, useState } from 'react';
import { API_BASE_URL } from '../../../config';

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
      let litigationResponse = await fetch(
        `${API_BASE_URL}/litigations?query=${authUser?.user_id}&search_fields[]=issuer_id&search_fields[]=assumed_author&page=${1}&limit=1000`,
      )
        .then((x) => x.json());

      if (litigationResponse.code >= 400) throw new Error('Failed to fetch litigations');

      // get litigations to judge
      const litigationToJudgeResponse = await fetch(
        `${API_BASE_URL}/litigations?judged_by=${authUser?.user_id}`,
      )
        .then((x) => x.json());
      if (litigationToJudgeResponse.code >= 400) throw new Error('Failed to fetch litigations');

      litigationResponse.results = [
        ...litigationResponse.results,
        ...(litigationToJudgeResponse?.results?.map((x) => ({ ...x, toJudge: true })) || []),
      ];

      // get details for each litigation
      litigationResponse = {
        ...litigationResponse,
        results: await Promise.all(litigationResponse?.results?.map(async (x) => {
          const litigation = { ...x };

          // get issuer details
          const issuer = x.issuer_id === authUser?.user_id ? authUser : await fetch(
            `${API_BASE_URL}/users/${x.issuer_id}`,
          ).then((y) => y.json()).catch(() => null);
          delete litigation.issuer_id;

          // get assumed author details
          const assumedAuthor = x.assumed_author === authUser?.user_id ? authUser : await fetch(
            `${API_BASE_URL}/users/${x.assumed_author}`,
          ).then((y) => y.json()).catch(() => null);
          delete litigation.assumed_author;

          const winner = x.winner === x.issuer_id ? issuer : assumedAuthor;

          // get creation details
          const creation = await fetch(
            `${API_BASE_URL}/creations/${x.creation_id}`,
          ).then((y) => y.json()).catch(() => null);
          delete litigation.creation_id;

          // get creation author
          creation.author = creation.author_id === authUser?.user_id ? authUser : await fetch(
            `${API_BASE_URL}/users/${creation.author_id}`,
          ).then((y) => y.json()).catch(() => null);
          delete creation.author_id;

          // get creation details
          let material = null;
          if (litigation.material_id) {
            // get material details
            material = await fetch(
              `${API_BASE_URL}/materials/${x.material_id}`,
            ).then((y) => y.json()).catch(() => null);

            // get material author
            material.author = material.author_id === authUser?.user_id ? authUser : await fetch(
              `${API_BASE_URL}/users/${material.author_id}`,
            ).then((y) => y.json()).catch(() => null);
            delete material.author_id;
          }
          delete litigation.material_id;

          // fill details of to judge litigations
          if (litigation.toJudge) {
            // get litigation invitation details
            litigation.invitations = await Promise.all(
              litigation.invitations.map(async (inviteId) => {
                // get invite details
                const invite = await fetch(
                  `${API_BASE_URL}/invitations/${inviteId}`,
                ).then((y) => y.json()).catch(() => null);

                // get invite status details
                const status = await fetch(
                  `${API_BASE_URL}/status/${invite.status_id}`,
                ).then((y) => y.json()).catch(() => null);

                // get invited user details
                const inviteTo = await fetch(
                  `${API_BASE_URL}/users/${invite.invite_to}`,
                ).then((y) => y.json()).catch(() => null);

                // update keys
                delete invite.status_id;
                delete invite.invite_to;
                invite.status = status;
                invite.invite_to = inviteTo;

                return invite;
              }),
            );

            // get litigation decisions details
            litigation.decisions = await Promise.all(
              // eslint-disable-next-line no-return-await
              litigation.decisions.map(async (decisionId) => await fetch(
                `${API_BASE_URL}/decision/${decisionId}`,
              ).then((y) => y.json()).catch(() => null)),
            );
          }

          return {
            ...litigation,
            issuer,
            assumed_author: assumedAuthor,
            creation,
            material,
            winner,
          };
        })),
      };

      // calculate open/closed and in progress litigations
      litigationResponse = {
        closed: litigationResponse?.results?.filter(
          (x) => moment(x.litigation_end).isBefore(new Date().toISOString()) || x.reconcilate,
        ),
        opening: litigationResponse?.results?.filter(
          (x) => moment(x.litigation_start).isAfter(new Date().toISOString()),
        ),
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
      const litigationResponse = await fetch(
        `${API_BASE_URL}/litigations/${id}`,
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reconcilate }),
        },
      ).then((x) => x.json());
      if (!litigationResponse || litigationResponse?.code >= 400) throw new Error('Failed to update litigation status');

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
      const litigationResponse = await fetch(
        `${API_BASE_URL}/litigations/${id}`,
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ownership_transferred: true }),
        },
      ).then((x) => x.json());
      if (!litigationResponse || litigationResponse?.code >= 400) throw new Error('Failed to transfer litigated item ownership!');

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
