import { useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../../config';

const useCreate = () => {
  const [loading, setLoading] = useState(false);
  const [newCreationStatus, setNewCreationStatus] = useState({
    success: false,
    error: null,
  });

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

    if (response.code === 400) throw new Error('Failed to create a source');
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

    if (response.code === 400) throw new Error('Failed to create a tag');
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

    if (response.code === 400) throw new Error('Failed to create a new material');
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

    if (response.code === 400) throw new Error('Failed to create a new material');
    return response;
  }, []);

  // creates a new material
  const makeNewMaterial = useCallback(async (authorBody = {}) => {
    const response = await fetch(`${API_BASE_URL}/materials`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authorBody),
    }).then((x) => x.json());

    if (response.code === 400) throw new Error('Failed to create a new material');
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
      const tags = await Promise.all(creationBody.tags.map((x) => makeNewTag({
        tag_name: x,
        tag_description: null,
      })));

      // make new materials (if creation has materials)
      let materials = [];
      if (creationBody.materials && creationBody.materials.length > 0) {
        materials = await Promise.all(creationBody.materials.map(async (x) => {
          // make new author
          const author = await makeNewAuthor({
            user_name: x.author,
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
            source_id: source.source_id,
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
        }),
      }).then((x) => x.json());

      if (response.code === 400) throw new Error('Failed to make a new creation');

      setNewCreationStatus({
        success: true,
        error: null,
      });
      setTimeout(() => setNewCreationStatus({
        success: false,
        error: null,
      }), 3000);
    } catch {
      setNewCreationStatus({
        success: false,
        error: 'Failed to make a new creation',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    newCreationStatus,
    makeNewCreation,
  };
};

export default useCreate;
