import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Litigation, Material } from 'api/requests';
import useSuggestions from 'hydraDemo/hooks/useSuggestions';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authUser from 'utils/helpers/authUser';
import { useLitigationsContext } from 'hydraDemo/contexts/LitigationsContext';
import {
  useDelegateServer, serverStates, makeVoteInterval, voteIntervalToISO,
} from 'hydraDemo/contexts/DelegateServerContext';
import { addressBech32ToPkh } from 'utils/helpers/wallet';
import statusTypes from 'utils/constants/statusTypes';

const useLitigationForm = ({ onLitigationFetch }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [litigationId, setLitigationId] = useState(null);
  const delegateServer = useDelegateServer();
  const { saveLitigation } = useLitigationsContext();
  const [user, setUser] = useState();

  useEffect(() => {
    const newUser = authUser.getUser();
    if (newUser) setUser(newUser);
  }, []);

  const {
    suggestions: authorSuggestions,
    suggestionsStatus: findAuthorsStatus,
    handleSuggestionInputChange: handleAuthorInputChange,
  } = useSuggestions({
    search: 'users',
    filterSuggestion: user?.user_name?.trim(),
  });

  const {
    suggestions: creationSuggestions,
    suggestionsStatus: fetchCreationsStatus,
    handleSuggestionInputChange: handleCreationInputChange,
  } = useSuggestions({
    search: 'creations',
  });

  // get litigation details
  const {
    data: litigation,
    isError: isFetchError,
    isSuccess: isFetchSuccess,
    isLoading: isFetchingLitigation,
  } = useQuery({
    queryKey: [`litigations-${litigationId}`],
    queryFn: async () => {
      // get litigation
      const toPopulate = ['creation_id', 'creation_id.author_id', 'creation_id.materials.author_id', 'material_id', 'assumed_author'];
      // eslint-disable-next-line sonarjs/no-empty-collection
      return await Litigation.getById(litigationId, toPopulate.map((x) => `populate=${x}`).join('&'));
    },
    enabled: !!litigationId,
  });

  // delete creation
  const {
    mutate: deleteLitigation,
    isError: isDeleteError,
    isSuccess: isDeleteSuccess,
    isLoading: isDeletingLitigation,
    reset: resetDeletionErrors,
  } = useMutation({
    mutationFn: async () => {
      await Litigation.delete(litigationId);

      // update queries
      queryClient.cancelQueries({ queryKey: ['litigations'] });
      queryClient.setQueryData(['litigations'], (data) => {
        if (data && data?.results) {
          const temporaryLitigations = data?.results?.filter(
            (x) => x?.litigation_id !== litigationId,
          );

          return { ...data, results: [...temporaryLitigations] };
        }
        return data;
      });
    },
  });

  // // create new litigation
  // const {
  //   mutate: makeNewLitigation,
  //   error: createLitigationError,
  //   isSuccess: isCreateLitigationSuccess,
  //   isLoading: isCreatingLitigation,
  // } = useMutation({
  //   mutationFn: async (litigationBody = {}) => {
  //     // make a new litigation
  //     const payload = {
  //       litigation_title: litigationBody.title.trim(),
  //       litigation_description: litigationBody?.description?.trim(),
  //       creation_id: litigationBody.creation,
  //       ...(litigationBody.material && { material_id: litigationBody.material }),
  //       is_draft: litigationBody.is_draft,
  //     };
  //     const response = litigation?.litigation_id
  //       ? await Litigation.update(litigation?.litigation_id, payload)
  //       : await Litigation.create(payload);
  //     setNewLitigation(response);

  //     // update queries
  //     queryClient.invalidateQueries({ queryKey: ['litigations'] });

  //     setTimeout(() => navigate('/litigations'), 2000);
  //   },
  // });

  const getJuryKeys = () => {
    const users = authUser.getAllUsers();

    // Remove self from jury pool
    delete users[user.walletAddress];

    return Object.values(users).map((x) => x.walletPkh);
  };

  const makeNewLitigation = (litigationBody = {}) => {
    console.log({ litigationBody });
    console.log({ serverState: delegateServer.state, headId: delegateServer.headId });

    if (!delegateServer.headId || delegateServer.state !== serverStates.awaitingCommits) {
      console.error('Not ready to create dispute');
      return;
    }

    if (!user.walletAddress) {
      console.error('Property `walletAddress` is missing from user');
      return;
    }

    const voteInterval = makeVoteInterval(1);
    const [votingStart, votingEnd] = voteIntervalToISO(voteInterval);

    const disputeTerms = {
      claimFor: 'DEMO_LITIGATION',
      claimer: addressBech32ToPkh(user.walletAddress),
      hydraHeadId: delegateServer.headId,
      jury: getJuryKeys(),
      voteInterval,
      debugCheckSignatures: false,
    };

    console.log('Creating dispute', disputeTerms);

    delegateServer.createDispute(disputeTerms);

    // TODO: Use actual material_id, auther, etc.
    const newLitigation = {
      litigation_title: litigationBody.title.trim(),
      litigation_description: litigationBody?.description?.trim(),
      material_id: 'd91f005d-2037-41b9-b706-0e70c651e4e2',
      assumed_author: 'dd7a824b-b0a9-4868-bdbf-cfa6bdd36621',
      assumed_author_response: statusTypes.START_LITIGATION,
      issuer_id: 'dd7a824b-b0a9-4868-bdbf-cfa6bdd36629',
      winner: 'dd7a824b-b0a9-4868-bdbf-cfa6bdd36629',
      recognitions: [],
      decisions: [],
      voting_start: votingStart,
      voting_end: votingEnd,
      reconcilate: false,
      created_at: '2022-09-05T19:00:00.000Z',
      ownership_transferred: false,
    };

    saveLitigation(newLitigation);

    setTimeout(() => navigate('/litigations'), 2000);
  };

  // trigger the callback when a litigation is fetched
  useEffect(() => {
    if (litigation) onLitigationFetch(litigation);
  }, [litigation]);

  return {
    isCreatingLitigation: delegateServer.state === serverStates.bidCommitted,
    newLitigationStatus: {
      success: delegateServer.state === serverStates.votingOpen,
      error: null, // TODO: Handle error case
    },
    makeNewLitigation,
    creationSuggestions,
    fetchCreationsStatus,
    findAuthorsStatus,
    authorSuggestions,
    handleCreationInputChange,
    handleAuthorInputChange,
    getMaterialDetail: Material.getById,
    getLitigationDetails: (id) => setLitigationId(id),
    fetchLitigationStatus: {
      success: isFetchSuccess,
      error: isFetchError ? 'Litigation Not Found' : null,
    },
    isFetchingLitigation,
    litigation,
    deleteLitigationStatus: {
      success: isDeleteSuccess,
      error: isDeleteError ? 'Failed to delete litigation' : null,
    },
    isDeletingLitigation,
    deleteLitigation,
    resetDeletionErrors,
  };
};

export default useLitigationForm;
