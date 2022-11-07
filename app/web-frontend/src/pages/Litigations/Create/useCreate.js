import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Invitation, Litigation, Material, User,
} from 'api/requests';
import useSuggestions from 'hooks/useSuggestions';
import { useState } from 'react';
import authUser from 'utils/helpers/authUser';

// get auth user
const user = authUser.get();

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

  // update recognition status
  const {
    mutate: makeNewLitigation,
    error: createLitigationError,
    isSuccess: isCreateLitigationSuccess,
    isLoading: isCreatingLitigation,
  } = useMutation({
    mutationFn: async (litigationBody = {}) => {
      // make a new litigation
      const response = await Litigation.create({
        litigation_title: litigationBody.title.trim(),
        litigation_description: litigationBody?.description?.trim(),
        creation_id: litigationBody.creation,
        material_id: litigationBody.material,
        issuer_id: user.user_id,
        litigation_start: new Date(litigationBody.publicDate).toISOString(),
        litigation_end: new Date(litigationBody.endDate).toISOString(),
        reconcilate: litigationBody.inviteAuthors,
      });

      // get data about invited judges
      response.invitations = await Promise.all(response.invitations.map(async (inviteId) => {
        const invitation = await Invitation.getById(inviteId);
        invitation.invite_to = await User.getById(invitation.invite_to);
        return invitation;
      }));

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
