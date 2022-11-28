import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  Creation, Recognition, Material, Tag, User,
} from 'api/requests';
import useSuggestions from 'hooks/useSuggestions';
import authUser from 'utils/helpers/authUser';
import moment from 'moment';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const makeCommonResource = async (
  requestBody = {},
  tagSuggestions = [],
  authorSuggestions = [],
) => {
  // make new tags
  const tags = await (async () => {
    const temporaryTags = [];

    await Promise.all(requestBody.tags.map(async (x) => {
      const foundTag = tagSuggestions.find(
        (tag) => tag.tag_name.toLowerCase().trim() === x.toLowerCase().trim(),
      );

      if (foundTag) {
        temporaryTags.push(foundTag);
        return;
      }

      // else create a new tag
      const newTag = await Tag.create({
        tag_name: x,
        tag_description: null,
      });
      temporaryTags.push(newTag);
    }));

    return temporaryTags;
  })();

  // make new materials (if creation has materials)
  let materials = [];
  if (requestBody.materials && requestBody.materials.length > 0) {
    materials = await Promise.all(requestBody.materials.map(async (x) => {
      // get author for material
      const author = await (async () => {
        let temporaryAuthor = null;

        // return if author found from suggestions
        temporaryAuthor = authorSuggestions.find(
          (suggestion) => suggestion.user_name.trim() === x.author.trim(),
        );
        if (temporaryAuthor) return temporaryAuthor;

        // find if the author exists in db
        temporaryAuthor = await User.getAll(`query=${x?.author?.trim()}&search_fields[]=user_name`);
        temporaryAuthor = temporaryAuthor?.results?.[0] || null;
        if (temporaryAuthor) return temporaryAuthor;

        // make new author
        temporaryAuthor = await User.create({
          user_name: x.author,
        });

        return temporaryAuthor;
      })();

      // make new material
      const material = await Material.create({
        material_title: x.title,
        material_link: x.link,
        material_type: x.fileType,
      });

      return { ...material, author_id: author.user_id };
    }));
  }

  return { tags, materials };
};

const sendRecognitions = async (
  materials = [],
) => await Promise.all(materials.map(async (x) => {
  // make new recognition
  const recognition = await Recognition.create({
    recognition_for: x.author_id,
    recognition_description: x.material_description,
    status: 'pending',
    status_updated: new Date().toISOString(),
  });

  // update material with recognition id
  await Material.update(x.material_id, {
    recognition_id: recognition.recognition_id,
  });
}));

// get auth user
const user = authUser.getUser();

const useCreationForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [creationId, setCreationId] = useState(null);

  // tag suggestions
  const {
    suggestions: tagSuggestions,
    suggestionsStatus: findTagsStatus,
    handleSuggestionInputChange: handleTagInputChange,
  } = useSuggestions({
    search: 'tags',
  });

  // author suggestions
  const {
    suggestions: authorSuggestions,
    suggestionsStatus: findAuthorsStatus,
    handleSuggestionInputChange: handleAuthorInputChange,
  } = useSuggestions({
    search: 'users',
    filterSuggestion: user?.user_name?.trim(),
  });

  // get creation details
  const {
    data: creation,
    isError: isFetchError,
    isSuccess: isFetchSuccess,
    isLoading: isFetchingCreation,
  } = useQuery({
    queryKey: [`creations-${creationId}`],
    queryFn: async () => {
      // get creation
      const toPopulate = ['author_id', 'materials', 'materials.author_id', 'tags'];
      const responseCreation = await Creation.getById(creationId, toPopulate.map((x) => `populate=${x}`).join('&'));

      // transform creation
      const temporaryTransformedCreation = {
        id: responseCreation.creation_id,
        date: moment(responseCreation.creation_date).format('YYYY-MM-DD'),
        description: responseCreation.creation_description,
        title: responseCreation.creation_title,
        is_draft: responseCreation.is_draft,
        author: responseCreation.author.user_name,
        source: responseCreation.creation_link,
        tags: responseCreation.tags.map((tag) => tag.tag_name),
        materials: (responseCreation?.materials || []).map((material) => (
          {
            id: material.material_id,
            author: material.author.user_name,
            link: material.material_link,
            fileType: material.material_type,
            title: material.material_title,
          }
        )),
      };

      return {
        original: responseCreation,
        transformed: temporaryTransformedCreation,
      };
    },
    enabled: !!creationId,
  });

  // create creation
  const {
    mutate: makeNewCreation,
    isError: isCreationError,
    isSuccess: isCreationSuccess,
    isLoading: isCreatingCreation,
  } = useMutation({
    mutationFn: async (creationBody) => {
      // create common data
      const { tags, materials } = await makeCommonResource(
        creationBody,
        tagSuggestions,
        authorSuggestions,
      );

      // make a new creation
      await Creation.create({
        creation_title: creationBody.title,
        creation_description: creationBody.description,
        creation_link: creationBody.source,
        tags: tags.map((tag) => tag.tag_id),
        ...(materials.length > 0 && { materials: materials.map((x) => x.material_id) }),
        creation_date: new Date(creationBody.date).toISOString(),
        is_draft: creationBody.is_draft,
      });

      // sent recognition to material authors (if creation is not draft)
      if (materials.length > 0 && !creationBody.is_draft) {
        await sendRecognitions(materials);
      }

      // remove queries cache
      queryClient.invalidateQueries({ queryKey: ['creations'] });

      // redirect user to creations page
      setTimeout(() => navigate('/creations'), 3000);
    },
  });

  // update creation
  const {
    mutate: updateCreation,
    isError: isUpdateError,
    isSuccess: isUpdateSuccess,
    isLoading: isUpdatingCreation,
  } = useMutation({
    mutationFn: async (updateBody) => {
      // updated creation body
      const updatedCreation = {
        creation_title: updateBody.title,
        creation_description: updateBody.description,
        creation_date: new Date(updateBody.date).toISOString(),
        ...((creation.original.materials || []).length > 0 && {
          materials: creation.original.materials || [],
        }),
        tags: creation.original.tags,
        creation_link: updateBody.source,
        is_draft: false,
      };

      const { tags, materials } = await makeCommonResource(
        updateBody,
        tagSuggestions,
        authorSuggestions,
      );

      updatedCreation.tags = tags.map((x) => x.tag_id);
      updatedCreation.materials = (
        (updateBody.materials || []).length === 0
      ) ? [] : materials.map((x) => x.material_id);

      // update creation
      await Creation.update(creation.original.creation_id, { ...updatedCreation });

      // sent recognition to material authors
      if (materials.length > 0) {
        await sendRecognitions(materials);
      }

      // remove queries cache
      queryClient.invalidateQueries({ queryKey: ['creations'] });

      // redirect user to creations page
      setTimeout(() => navigate('/creations'), 3000);
    },
  });

  return {
    loading: isCreatingCreation,
    newCreationStatus: {
      success: isCreationSuccess,
      error: isCreationError ? 'Failed to make a new creation' : null,
    },
    makeNewCreation,
    isFetchingCreation,
    isUpdatingCreation,
    tagSuggestions,
    findTagsStatus,
    findAuthorsStatus,
    authorSuggestions,
    handleTagInputChange,
    getCreationDetails: (id) => setCreationId(id),
    transformedCreation: creation?.transformed,
    updateCreation,
    updateCreationStatus: {
      success: isUpdateSuccess,
      error: isUpdateError ? 'Failed to update creation' : null,
    },
    fetchCreationStatus: {
      success: isFetchSuccess,
      error: isFetchError ? 'Creation Not Found' : null,
    },
    handleAuthorInputChange,
  };
};

export default useCreationForm;
