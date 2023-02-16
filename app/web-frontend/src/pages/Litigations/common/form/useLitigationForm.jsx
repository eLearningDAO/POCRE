import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Litigation, Material } from 'api/requests';
import useSuggestions from 'hooks/useSuggestions';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authUser from 'utils/helpers/authUser';
import { CHARGES, TRANSACTION_PURPOSES } from 'config';
import { transactADAToPOCRE } from 'utils/helpers/wallet';

// get auth user
const user = authUser.getUser();

const useLitigationForm = ({ onLitigationFetch }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newLitigation, setNewLitigation] = useState(null);
  const [litigationId, setLitigationId] = useState(null);

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

  // create new litigation
  const {
    mutate: makeNewLitigation,
    error: createLitigationError,
    isSuccess: isCreateLitigationSuccess,
    isLoading: isCreatingLitigation,
  } = useMutation({
    mutationFn: async (litigationBody = {}) => {
      // make a new litigation
      const payload = {
        litigation_title: litigationBody.title.trim(),
        litigation_description: litigationBody?.description?.trim(),
        creation_id: litigationBody.creation,
        material_id: litigationBody.material,
        is_draft: litigationBody.is_draft,
      };
      const response = litigation?.litigation_id
        ? await Litigation.update(litigation?.litigation_id, payload)
        : await Litigation.create(payload);
      setNewLitigation(response);

      // make transaction
      if (!litigationBody.is_draft) {
        const txHash = await transactADAToPOCRE({
          amountADA: CHARGES.LITIGATION.START,
          purposeDesc: TRANSACTION_PURPOSES.LITIGATION.START,
          walletName: authUser.getUser()?.selectedWallet,
          metaData: {
            claimed_entity: litigationBody.material ? 'MATERIAL' : 'CREATION',
            creation_id: litigationBody.creation,
            material_id: litigationBody.material,
          },
        });

        if (!txHash) throw new Error('Failed to make transaction');
      }

      // update queries
      queryClient.invalidateQueries({ queryKey: ['litigations'] });

      setTimeout(() => navigate('/litigations'), 2000);
    },
  });

  // trigger the callback when a litigation is fetched
  useEffect(() => {
    if (litigation) onLitigationFetch(litigation);
  }, [litigation]);

  return {
    isCreatingLitigation,
    newLitigation,
    newLitigationStatus: {
      success: isCreateLitigationSuccess,
      error: createLitigationError?.message || null,
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
