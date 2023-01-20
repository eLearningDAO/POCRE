import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Recognition, Litigation, Material, User,
} from 'api/requests';
import useSuggestions from 'hooks/useSuggestions';
import { useState } from 'react';
import authUser from 'utils/helpers/authUser';
import { CHARGES, TRANSACTION_PURPOSES } from 'config';
import { transactADAToPOCRE } from 'utils/helpers/wallet';

// get auth user
const user = authUser.getUser();

const useCreate = () => {
  const queryClient = useQueryClient();
  const [newLitigation, setNewLitigation] = useState(null);

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

  // create new litigation
  const {
    mutate: makeNewLitigation,
    error: createLitigationError,
    isSuccess: isCreateLitigationSuccess,
    isLoading: isCreatingLitigation,
  } = useMutation({
    mutationFn: async (litigationBody = {}) => {
      // make transaction
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

      // make a new litigation
      const response = await Litigation.create({
        litigation_title: litigationBody.title.trim(),
        litigation_description: litigationBody?.description?.trim(),
        creation_id: litigationBody.creation,
        material_id: litigationBody.material,
        litigation_start: new Date(litigationBody.publicDate).toISOString(),
        litigation_end: new Date(litigationBody.endDate).toISOString(),
      });

      // get data about recognized judges
      response.recognitions = await Promise.all(response.recognitions.map(
        async (recognitionId) => {
          const recognition = await Recognition.getById(recognitionId);
          recognition.recognition_for = await User.getById(recognition.recognition_for);
          return recognition;
        },
      ));

      setNewLitigation(response);

      // update queries
      queryClient.invalidateQueries({ queryKey: ['litigations'] });
    },
  });

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
  };
};

export default useCreate;
