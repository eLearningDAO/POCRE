import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';
import { API_BASE_URL } from '../../../config';

let debounceTagInterval = null;
let debounceAuthorInterval = null;

const useCreate = () => {
  const [isCreatingLitigation, setIsCreatingLitigation] = useState(false);
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

      setCreationSuggestions([...creationSuggestions, ...validSuggestions]);
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

      // make new invitations
      const invitations = await (async () => []
      // TODO: how do we decide on who will receive invitations
      )();

      // check if creation exists
      const foundCreation = creationSuggestions.find(
        (x) => x.creation_id === litigationBody.creation,
      );
      if (!foundCreation) throw new Error('invalid creation');

      // check if author exists
      const foundAuthor = authorSuggestions.find((x) => x.user_id === litigationBody.author);
      if (!foundAuthor) throw new Error('invalid author');

      // get auth user
      // const user = JSON.parse(Cookies.get('activeUser') || '{}');

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
          issuer_id: litigationBody.author,
          invitations,
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
    } catch (error) {
      const errorMap = {
        'creation already assigned to a litigation': 'A litigation for this creation already exists',
        'material already assigned to a litigation': 'A litigation for this material already exists',
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
