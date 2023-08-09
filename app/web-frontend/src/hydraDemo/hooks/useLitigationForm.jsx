import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Litigation, Material } from 'api/requests';
import useMockSuggestions from 'hooks/useMockSuggestions';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authUser from 'utils/helpers/authUser';
import { useLitigationsContext } from 'hydraDemo/contexts/LitigationsContext';
import { useDelegateServer, serverStates, makeTestTerms } from '../contexts/DelegateServerContext';

// get auth user
const user = authUser.getUser();

const useLitigationForm = ({ onLitigationFetch }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newLitigation, setNewLitigation] = useState(null);
  const [litigationId, setLitigationId] = useState(null);
  const delegateServer = useDelegateServer();
  const { addLitigation } = useLitigationsContext();

  const {
    suggestions: authorSuggestions,
    suggestionsStatus: findAuthorsStatus,
    handleSuggestionInputChange: handleAuthorInputChange,
  } = useMockSuggestions({
    search: 'users',
    filterSuggestion: user?.user_name?.trim(),
  });

  const {
    suggestions: creationSuggestions,
    suggestionsStatus: fetchCreationsStatus,
    handleSuggestionInputChange: handleCreationInputChange,
  } = useMockSuggestions({
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

  const makeNewLitigation = (litigationBody = {}) => {
    console.log({ litigationBody });
    console.log({ serverState: delegateServer.state, headId: delegateServer.headId });

    if (!delegateServer.headId || delegateServer.state !== serverStates.awaitingCommits) {
      console.log('Not ready to create dispute');
      return;
    }

    console.log('Creating dispute');
    const testTerms = makeTestTerms(delegateServer.headId);
    delegateServer.createDispute(testTerms);

    setNewLitigation({
      litigation_title: litigationBody.title.trim(),
      litigation_description: litigationBody?.description?.trim(),
      creation_id: litigationBody.creation,
      ...(litigationBody.material && { material_id: litigationBody.material }),
      is_draft: litigationBody.is_draft,
    });

    // TODO: pass in actual litigation
    addLitigation();

    setTimeout(() => navigate('/litigations'), 2000);
  };

  // trigger the callback when a litigation is fetched
  useEffect(() => {
    if (litigation) onLitigationFetch(litigation);
  }, [litigation]);

  return {
    isCreatingLitigation: delegateServer.state === serverStates.bidCommitted,
    newLitigation,
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
