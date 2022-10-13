import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';
import { API_BASE_URL } from '../../../config';

let debounceTagInterval = null;
let debounceAuthorInterval = null;

const useCreate = () => {
  const [isCreatingLitigation, setIsCreatingLitigation] = useState(false);
  const [newLitigation, setNewLitigation] = useState(null);
  const [newLitigationStatus, setNewLitigationStatus] = useState({
    success: false,
    error: null,
  });
  const [fetchCreationsStatus, setFetchCreationsStatus] = useState({
    success: false,
    error: null,
  });
  const [creationSuggestions, setCreationSuggestions] = useState([]);
  const [findAuthorsStatus, setFindAuthorsStatus] = useState({
    success: false,
    error: null,
  });
  const [authorSuggestions, setAuthorSuggestions] = useState([]);

  // get creation suggestions
  const findCreationSuggestions = useCallback(async (searchText = '') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/creations?query=${searchText}&search_fields[]=creation_title`,
      ).then((x) => x.json());

      if (response.code >= 400) throw new Error('Failed to get creation suggestion');

      setFetchCreationsStatus({
        success: true,
        error: null,
      });
      setTimeout(() => setFetchCreationsStatus({
        success: false,
        error: null,
      }), 3000);

      return response;
    } catch {
      setFetchCreationsStatus({
        success: false,
        error: 'Failed to get creation suggestion',
      });
    }
    return null;
  }, []);

  // get creation suggestions
  const getMaterialDetail = useCallback(async (id = '') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/materials/${id}`,
      ).then((x) => x.json());

      if (response.code >= 400) throw new Error('Failed to get material details');

      return response;
    } catch (error) {
      return error?.message;
    }
  }, []);

  // get creation suggestion on creation input change
  const handleCreationInputChange = async (event) => {
    if (debounceTagInterval) clearTimeout(debounceTagInterval);

    debounceTagInterval = await setTimeout(async () => {
      const value = event.target.value.trim();
      if (!value) return;

      const suggestions = await findCreationSuggestions(value);

      const validSuggestions = [];

      suggestions?.results?.map(
        (x) => validSuggestions.findIndex((y) => y.creation_title === x.creation_title) <= -1
        && validSuggestions.push(x),
      );

      setCreationSuggestions([
        ...creationSuggestions,
        ...validSuggestions.filter((x) => x.is_claimable),
      ]);
    }, 500);
  };

  // get author suggestions
  const findAuthorSuggestions = useCallback(async (searchText = '') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users?query=${searchText}&search_fields[]=user_name`,
      ).then((x) => x.json());

      if (response.code >= 400) throw new Error('Failed to get user suggestion');

      setFindAuthorsStatus({
        success: true,
        error: null,
      });
      setTimeout(() => setFindAuthorsStatus({
        success: false,
        error: null,
      }), 3000);

      return response;
    } catch {
      setFindAuthorsStatus({
        success: false,
        error: 'Failed to get user suggestion',
      });
    }
    return null;
  }, []);

  // get creation suggestion on author input change
  const handleAuthorInputChange = async (event) => {
    if (debounceAuthorInterval) clearTimeout(debounceAuthorInterval);

    debounceAuthorInterval = await setTimeout(async () => {
      const value = event.target.value.trim();
      if (!value) return;

      const suggestions = await findAuthorSuggestions(value);

      const validSuggestions = [];

      const user = JSON.parse(Cookies.get('activeUser') || '{}');
      suggestions?.results?.filter((x) => x.user_name.trim() !== user?.user_name?.trim()).map(
        (x) => validSuggestions.findIndex((y) => y.user_id === x.user_id) <= -1
        && validSuggestions.push(x),
      );

      setAuthorSuggestions([...authorSuggestions, ...validSuggestions]);
    }, 500);
  };

  // creates new new creation
  const makeNewLitigation = useCallback(async (litigationBody = {}) => {
    try {
      setIsCreatingLitigation(true);

      // get auth user
      const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

      // make a new litigation
      const response = await fetch(`${API_BASE_URL}/litigations`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          litigation_title: litigationBody.title.trim(),
          litigation_description: litigationBody.description?.trim(),
          creation_id: litigationBody.creation,
          material_id: litigationBody.material,
          issuer_id: authUser.user_id,
          litigation_start: new Date(litigationBody.publicDate).toISOString(),
          litigation_end: new Date(litigationBody.endDate).toISOString(),
          reconcilate: litigationBody.inviteAuthors,
        }),
      }).then((x) => x.json());

      if (response.code >= 400) throw new Error(response.message);

      setNewLitigationStatus({
        success: true,
        error: null,
      });

      // get data about invited judges
      response.invitations = await Promise.all(response.invitations.map(async (inviteId) => {
        const invitation = await fetch(
          `${API_BASE_URL}/invitations/${inviteId}`,
        ).then((x) => x.json());

        invitation.invite_to = await fetch(
          `${API_BASE_URL}/users/${invitation.invite_to}`,
        ).then((x) => x.json());

        return invitation;
      }));
      setNewLitigation(response);
    } catch (error) {
      const errorMap = {
        'creation already assigned to a litigation': 'A litigation for this creation already exists',
        'material already assigned to a litigation': 'A litigation for this material already exists',
        'creation is not claimable': 'This creation has already been claimed by someone',
        'material is not claimable': 'This material has already been claimed by someone',
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
    getMaterialDetail,
  };
};

export default useCreate;
