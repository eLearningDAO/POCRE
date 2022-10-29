import { useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';

// get auth user
const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

let debounceTagInterval = null;
let debounceAuthorInterval = null;

const useCreate = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [newCreationStatus, setNewCreationStatus] = useState({
    success: false,
    error: null,
  });
  const [findTagsStatus, setFindTagsStatus] = useState({
    success: false,
    error: null,
  });
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [findAuthorsStatus, setFindAuthorsStatus] = useState({
    success: false,
    error: null,
  });
  const [authorSuggestions, setAuthorSuggestions] = useState([]);

  // get tag suggestions
  const findTagSuggestions = useCallback(async (searchText = '') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tags?query=${searchText}&search_fields[]=tag_name`,
      ).then((x) => x.json());

      if (response.code >= 400) throw new Error('Failed to get tag suggestion');

      setFindTagsStatus({
        success: true,
        error: null,
      });
      setTimeout(() => setFindTagsStatus({
        success: false,
        error: null,
      }), 3000);

      return response;
    } catch {
      setFindTagsStatus({
        success: false,
        error: 'Failed to get tag suggestion',
      });
    }
    return null;
  }, []);

  // get tag suggestion on tag input change
  const handleTagInputChange = async (event) => {
    if (debounceTagInterval) clearTimeout(debounceTagInterval);

    debounceTagInterval = await setTimeout(async () => {
      const value = event.target.value.trim();
      if (!value) return;

      const suggestions = await findTagSuggestions(value);

      const validSuggestions = [];

      suggestions?.results?.map(
        (x) => validSuggestions.findIndex((y) => y.tag_name === x.tag_name) <= -1
        && validSuggestions.push(x),
      );

      setTagSuggestions([...tagSuggestions, ...validSuggestions]);
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

  // get tag suggestion on tag input change
  const handleAuthorInputChange = async (event) => {
    if (debounceAuthorInterval) clearTimeout(debounceAuthorInterval);

    debounceAuthorInterval = await setTimeout(async () => {
      const value = event.target.value.trim();
      if (!value) return;

      const suggestions = await findAuthorSuggestions(value);

      const validSuggestions = [];

      suggestions?.results?.filter((x) => x.user_name.trim() !== authUser.user_name.trim()).map(
        (x) => validSuggestions.findIndex((y) => y.user_id === x.user_id) <= -1
        && validSuggestions.push(x),
      );

      setAuthorSuggestions([...authorSuggestions, ...validSuggestions]);
    }, 500);
  };

  // creates a new source
  const makeNewSource = useCallback(async (sourceBody = {}) => {
    const response = await fetch(`${API_BASE_URL}/source`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sourceBody),
    }).then((x) => x.json());

    if (response.code >= 400) throw new Error('Failed to create a source');
    return response;
  }, []);

  // creates a new tag
  const makeNewTag = useCallback(async (tagBody = {}) => {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tagBody),
    }).then((x) => x.json());

    if (response.code >= 400) throw new Error('Failed to create a tag');
    return response;
  }, []);

  // creates a new author
  const makeNewAuthor = useCallback(async (authorBody = {}) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authorBody),
    }).then((x) => x.json());

    if (response.code >= 400) throw new Error('Failed to create a new material');
    return response;
  }, []);

  // creates a new material type
  const makeNewMaterialType = useCallback(async (materialTypeBody = {}) => {
    const response = await fetch(`${API_BASE_URL}/material-type`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(materialTypeBody),
    }).then((x) => x.json());

    if (response.code >= 400) throw new Error('Failed to create a new material');
    return response;
  }, []);

  // creates a new material
  const makeNewMaterial = useCallback(async (materialBody = {}) => {
    const response = await fetch(`${API_BASE_URL}/materials`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(materialBody),
    }).then((x) => x.json());

    if (response.code >= 400) throw new Error('Failed to create a new material');
    return response;
  }, []);

  // creates a new material
  const updateMaterial = useCallback(async (materialId, materialBody = {}) => {
    const response = await fetch(`${API_BASE_URL}/materials/${materialId}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(materialBody),
    }).then((x) => x.json());

    if (response.code >= 400) throw new Error('Failed to update material');
    return response;
  }, []);

  // creates a new status
  const makeNewStatus = useCallback(async (statusBody = {}) => {
    const response = await fetch(`${API_BASE_URL}/status`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusBody),
    }).then((x) => x.json());

    if (response.code >= 400) throw new Error('Failed to create a new status');
    return response;
  }, []);

  // creates a new invitation
  const makeNewInvitation = useCallback(async (invitationBody = {}) => {
    const response = await fetch(`${API_BASE_URL}/invitations`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invitationBody),
    }).then((x) => x.json());

    if (response.code >= 400) throw new Error('Failed to create a new invitation');
    return response;
  }, []);

  // creates new new creation
  const makeNewCreation = useCallback(async (creationBody = {}) => {
    try {
      setLoading(true);

      // make a new source
      const source = await makeNewSource({
        source_title: creationBody.title,
        source_description: creationBody.description,
        site_url: creationBody.source,
      });

      // make new tags
      const tags = await (async () => {
        const temporaryTags = [];

        await Promise.all(creationBody.tags.map(async (x) => {
          const foundTag = tagSuggestions.find(
            (tag) => tag.tag_name.toLowerCase().trim() === x.toLowerCase().trim(),
          );

          if (foundTag) {
            temporaryTags.push(foundTag);
            return;
          }

          // else create a new tag
          const newTag = await makeNewTag({
            tag_name: x,
            tag_description: null,
          });
          temporaryTags.push(newTag);
        }));

        return temporaryTags;
      })();

      // make new materials (if creation has materials)
      let materials = [];
      if (creationBody.materials && creationBody.materials.length > 0) {
        materials = await Promise.all(creationBody.materials.map(async (x) => {
          // get author for material
          const author = await (async () => {
            let temporaryAuthor = null;

            // return if author found from suggestions
            temporaryAuthor = authorSuggestions.find(
              (suggestion) => suggestion.user_name.trim() === x.author.trim(),
            );
            if (temporaryAuthor) return temporaryAuthor;

            // make new author
            temporaryAuthor = await makeNewAuthor({
              user_name: x.author,
            });

            return temporaryAuthor;
          })();

          // make a new source for material
          const materialSource = await makeNewSource({
            source_title: x.title,
            site_url: creationBody.source,
          });

          // make new material type
          const materialType = await makeNewMaterialType({
            type_name: x.fileType,
            type_description: x.title,
          });

          // make new material
          return makeNewMaterial({
            material_title: x.title,
            material_link: x.link,
            source_id: materialSource.source_id,
            type_id: materialType.type_id,
            author_id: author.user_id,
          });
        }));
      }

      // get auth user
      const user = JSON.parse(Cookies.get('activeUser') || '{}');

      // make a new creation
      const response = await fetch(`${API_BASE_URL}/creations`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_title: creationBody.title,
          creation_description: creationBody.description,
          source_id: source.source_id,
          tags: tags.map((tag) => tag.tag_id),
          author_id: user.user_id,
          ...(materials.length > 0 && { materials: materials.map((x) => x.material_id) }),
          creation_date: new Date(creationBody.date).toISOString(),
          is_draft: creationBody.is_draft,
        }),
      }).then((x) => x.json());

      if (response.code >= 400) throw new Error('Failed to make a new creation');

      // sent invitation to material authors (if creation is not draft)
      if (materials.length > 0 && !creationBody.is_draft) {
        await Promise.all(materials.map(async (x) => {
          // make new status
          const status = await makeNewStatus({
            status_name: 'pending',
            status_description: x.material_description,
          });

          // make new invite
          const invitation = await makeNewInvitation({
            invite_from: user.user_id,
            invite_to: x.author_id,
            invite_description: x.material_description,
            status_id: status.status_id,
          });

          // update material with invitation id
          await updateMaterial(x.material_id, {
            invite_id: invitation.invite_id,
          });
        }));
      }

      setNewCreationStatus({
        success: true,
        error: null,
      });

      // redirect user to creations page
      setTimeout(() => navigate('/creations'), 3000);
    } catch {
      setNewCreationStatus({
        success: false,
        error: 'Failed to make a new creation',
      });
    } finally {
      setLoading(false);
    }
  }, [tagSuggestions, authorSuggestions]);

  return {
    loading,
    newCreationStatus,
    makeNewCreation,
    tagSuggestions,
    findTagsStatus,
    findAuthorsStatus,
    authorSuggestions,
    handleTagInputChange,
    handleAuthorInputChange,
  };
};

export default useCreate;