import {
  Invitation, Litigation, Material, User,
} from 'api/requests';
import useSuggestions from 'hooks/useSuggestions';
import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';

// get auth user
const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

const useCreate = () => {
  const [isCreatingLitigation, setIsCreatingLitigation] = useState(false);
  const [newLitigation, setNewLitigation] = useState(null);
  const [newLitigationStatus, setNewLitigationStatus] = useState({
    success: false,
    error: null,
  });

  const {
    suggestions: authorSuggestions,
    suggestionsStatus: findAuthorsStatus,
    handleSuggestionInputChange: handleAuthorInputChange,
  } = useSuggestions({
    search: 'users',
    filterSuggestion: authUser?.user_name?.trim(),
  });

  const {
    suggestions: creationSuggestions,
    suggestionsStatus: fetchCreationsStatus,
    handleSuggestionInputChange: handleCreationInputChange,
  } = useSuggestions({
    search: 'creations',
  });

  // creates new new creation
  const makeNewLitigation = useCallback(async (litigationBody = {}) => {
    try {
      setIsCreatingLitigation(true);

      // get auth user
      const user = JSON.parse(Cookies.get('activeUser') || '{}');

      // make a new litigation
      const response = await Litigation.create({
        litigation_title: litigationBody.title.trim(),
        litigation_description: litigationBody.description?.trim(),
        creation_id: litigationBody.creation,
        material_id: litigationBody.material,
        issuer_id: user.user_id,
        litigation_start: new Date(litigationBody.publicDate).toISOString(),
        litigation_end: new Date(litigationBody.endDate).toISOString(),
        reconcilate: litigationBody.inviteAuthors,
      });

      setNewLitigationStatus({
        success: true,
        error: null,
      });

      // get data about invited judges
      response.invitations = await Promise.all(response.invitations.map(async (inviteId) => {
        const invitation = await Invitation.getById(inviteId);
        invitation.invite_to = await User.getById(invitation.invite_to);
        return invitation;
      }));
      setNewLitigation(response);
    } catch (error) {
      const errorMap = {
        '"litigation_end" must be greater than "ref:litigation_start"': 'End date must be greater than start date',
        'creation already assigned to a litigation': 'A litigation for this creation already exists',
        'material already assigned to a litigation': 'A litigation for this material already exists',
        'creation is not claimable': 'This creation has already been claimed by someone',
        'creation is already owned': 'This creation has already been claimed and owned by someone',
        'material is not claimable': 'This material has already been claimed by someone',
        'material is already owned': 'This material has already been claimed and owned by someone',
        'material does not belong to creation': 'The material does not belong to linked creation',
        'creation with materials are not allowed to be litigated': 'The selected creation requires a material to be litigated',
        'invalid creation': 'Please select a valid creation from the suggested list',
        'invalid author': 'Please select a valid author from the suggested list',
        'invalid material': 'Please select a valid material from the suggested list',
      };

      setNewLitigationStatus({
        success: false,
        error: errorMap?.[error?.message] || 'Failed to make a new litigation',
      });
    } finally {
      setIsCreatingLitigation(false);
    }
  }, [creationSuggestions, authorSuggestions]);

  return {
    isCreatingLitigation,
    newLitigation,
    newLitigationStatus,
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
