import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { API_BASE_URL } from '../../../config';

let debounceTagInterval = null;
let debounceAuthorInterval = null;

const useUpdate = () => {
  const navigate = useNavigate();

  const [isFetchingCreation, setIsFetchingCreation] = useState(false);
  const [isUpdatingCreation, setIsUpdatingCreation] = useState(false);
  const [fetchCreationStatus, setFetchCreationStatus] = useState({
    success: false,
    error: true,
  });
  const [updateCreationStatus, setUpdateCreationStatus] = useState({
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

  const [originalCreation, setOriginalCreation] = useState(null);
  const [transformedCreation, setTransformedCreation] = useState(null);

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

      if (response.code === 400) throw new Error('Failed to get user suggestion');

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

      suggestions?.results?.map(
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
  const makeNewMaterial = useCallback(async (authorBody = {}) => {
    const response = await fetch(`${API_BASE_URL}/materials`, {
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

  // creates new new creation
  const updateCreation = useCallback(async (updateBody = {}) => {
    try {
      setIsUpdatingCreation(true);

      // updated creation body
      const updatedCreation = {
        creation_title: updateBody.title,
        creation_description: updateBody.description,
        creation_date: new Date(updateBody.date).toISOString(),
        ...(originalCreation.materials.length > 0 && { materials: originalCreation.materials }),
        tags: originalCreation.tags,
        source_id: originalCreation.source_id,
        is_draft: false,
      };

      // make new source
      const source = await makeNewSource({
        source_title: updatedCreation.creation_title,
        site_url: updateBody.source,
      });
      updatedCreation.source_id = source.source_id;

      // make new tags
      const tags = await Promise.all(updateBody.tags.map((x) => makeNewTag({
        tag_name: x,
        tag_description: null,
      })));
      updatedCreation.tags = tags.map((x) => x.tag_id);

      // make new materials (if creation has materials)
      let materials = [];
      if (updateBody.materials && updateBody.materials.length > 0) {
        materials = await Promise.all(updateBody.materials.map(async (x) => {
          // make new author
          const author = await makeNewAuthor({
            user_name: x.author,
          });

          // make a new source for material
          const materialSource = await makeNewSource({
            source_title: x.title,
            site_url: updateBody.source,
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
      updatedCreation.materials = (
        (updateBody.materials || []).length === 0
      ) ? [] : materials.map((x) => x.material_id);

      // update creation
      const response = await fetch(`${API_BASE_URL}/creations/${originalCreation.creation_id}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updatedCreation }),
      }).then((x) => x.json());

      if (response.code >= 400) throw new Error('Failed to update creation');

      // delete extra source
      await fetch(`${API_BASE_URL}/source/${originalCreation.source_id}`, {
        method: 'DELETE',
      }).then(() => null);

      // delete extra materials
      await Promise.all(originalCreation.materials.map((materialId) => fetch(`${API_BASE_URL}/materials/${materialId}`, {
        method: 'DELETE',
      }).then(() => null)));

      setUpdateCreationStatus({
        success: true,
        error: null,
      });

      // redirect user to creations page
      setTimeout(() => navigate('/creations'), 3000);
    } catch {
      setUpdateCreationStatus({
        success: false,
        error: 'Failed to update creation',
      });
    } finally {
      setIsUpdatingCreation(false);
    }
  }, [originalCreation, transformedCreation]);

  const getCreationDetails = async (id) => {
    try {
      setIsFetchingCreation(true);

      // get creation
      const responseCreation = await fetch(`${API_BASE_URL}/creations/${id}`).then((x) => x.json());
      if (responseCreation.code >= 400) throw new Error(responseCreation.message);

      // get creation source
      const responseCreationSource = await fetch(`${API_BASE_URL}/source/${responseCreation.source_id}`).then((x) => x.json());
      if (responseCreationSource.code >= 400) throw new Error(responseCreationSource.message);

      // get creation author
      const responseCreationAuthor = await fetch(`${API_BASE_URL}/users/${responseCreation.author_id}`).then((x) => x.json());
      if (responseCreationAuthor.code >= 400) throw new Error(responseCreationAuthor.message);

      // get creation materials
      const responseCreationMaterials = await Promise.all(
        responseCreation.materials.map(async (materialId) => {
          const materialDetail = await fetch(`${API_BASE_URL}/materials/${materialId}`).then((x) => x.json());

          const materialTypeDetail = await fetch(`${API_BASE_URL}/material-type/${materialDetail.type_id}`).then((x) => x.json());

          const materialSourceDetail = await fetch(`${API_BASE_URL}/source/${materialDetail.source_id}`).then((x) => x.json());

          const materialAuthorDetail = await fetch(`${API_BASE_URL}/users/${materialDetail.author_id}`).then((x) => x.json());

          materialDetail.type = materialTypeDetail;
          materialDetail.source = materialSourceDetail;
          materialDetail.author = materialAuthorDetail;

          return materialDetail;
        }),
      );
      if (responseCreationMaterials.code >= 400) throw new Error(responseCreationMaterials.message);

      // get creation tags
      const responseCreationTags = await Promise.all(
        responseCreation.tags.map((tagId) => fetch(`${API_BASE_URL}/tags/${tagId}`).then((x) => x.json())),
      );
      if (responseCreationTags.code >= 400) throw new Error(responseCreationTags.message);

      // transform creation
      const temporaryTransformedCreation = {
        id: responseCreation.creation_id,
        date: moment(responseCreation.creation_date).format('YYYY-MM-DD'),
        description: responseCreation.creation_description,
        title: responseCreation.creation_title,
        is_draft: responseCreation.is_draft,
        author: responseCreationAuthor.user_name,
        source: responseCreationSource.site_url,
        tags: responseCreationTags.map((tag) => tag.tag_name),
        materials: responseCreationMaterials.map((material) => (
          {
            id: material.material_id,
            author: material.author.user_name,
            link: material.material_link,
            fileType: material.type.type_name,
            title: material.material_title,
          }
        )),
      };

      setOriginalCreation(responseCreation);
      setTransformedCreation(temporaryTransformedCreation);
      setFetchCreationStatus({
        success: true,
        error: null,
      });
    } catch {
      setFetchCreationStatus({
        success: false,
        error: 'Creation Not Found',
      });
    } finally {
      setIsFetchingCreation(false);
    }
  };

  return {
    isFetchingCreation,
    isUpdatingCreation,
    tagSuggestions,
    findTagsStatus,
    findAuthorsStatus,
    authorSuggestions,
    handleTagInputChange,
    getCreationDetails,
    transformedCreation,
    updateCreation,
    updateCreationStatus,
    fetchCreationStatus,
    handleAuthorInputChange,
  };
};

export default useUpdate;
