import {
  Creation, Invitation, Material, MaterialType, Source, Status, Tag, User,
} from 'api/requests';
import useSuggestions from 'hooks/useSuggestions';
import Cookies from 'js-cookie';
import moment from 'moment';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// get auth user
const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

const useCreationForm = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [newCreationStatus, setNewCreationStatus] = useState({
    success: false,
    error: null,
  });
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

  const [originalCreation, setOriginalCreation] = useState(null);
  const [transformedCreation, setTransformedCreation] = useState(null);

  const {
    suggestions: tagSuggestions,
    suggestionsStatus: findTagsStatus,
    handleSuggestionInputChange: handleTagInputChange,
  } = useSuggestions({
    search: 'tags',
  });

  const {
    suggestions: authorSuggestions,
    suggestionsStatus: findAuthorsStatus,
    handleSuggestionInputChange: handleAuthorInputChange,
  } = useSuggestions({
    search: 'users',
    filterSuggestion: authUser?.user_name?.trim(),
  });

  // creates new new creation
  const makeNewCreation = useCallback(async (creationBody = {}) => {
    try {
      setLoading(true);

      // make a new source
      const source = await Source.create({
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
            temporaryAuthor = await User.create({
              user_name: x.author,
            });

            return temporaryAuthor;
          })();

          // make a new source for material
          const materialSource = await Source.create({
            source_title: x.title,
            site_url: creationBody.source,
          });

          // make new material type
          const materialType = await MaterialType.create({
            type_name: x.fileType,
            type_description: x.title,
          });

          // make new material
          return Material.create({
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
      await Creation.create({
        creation_title: creationBody.title,
        creation_description: creationBody.description,
        source_id: source.source_id,
        tags: tags.map((tag) => tag.tag_id),
        author_id: user.user_id,
        ...(materials.length > 0 && { materials: materials.map((x) => x.material_id) }),
        creation_date: new Date(creationBody.date).toISOString(),
        is_draft: creationBody.is_draft,
      });

      // sent invitation to material authors (if creation is not draft)
      if (materials.length > 0 && !creationBody.is_draft) {
        await Promise.all(materials.map(async (x) => {
          // make new status
          const status = await Status.create({
            status_name: 'pending',
            status_description: x.material_description,
          });

          // make new invite
          const invitation = await Invitation.create({
            invite_from: user.user_id,
            invite_to: x.author_id,
            invite_description: x.material_description,
            status_id: status.status_id,
          });

          // update material with invitation id
          await Material.update(x.material_id, {
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
      const source = await Source.create({
        source_title: updatedCreation.creation_title,
        site_url: updateBody.source,
      });
      updatedCreation.source_id = source.source_id;

      // make new tags
      const tags = await (async () => {
        const temporaryTags = [];

        // eslint-disable-next-line sonarjs/no-identical-functions
        await Promise.all(updateBody.tags.map(async (x) => {
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
      updatedCreation.tags = tags.map((x) => x.tag_id);

      // make new materials (if creation has materials)
      let materials = [];
      if (updateBody.materials && updateBody.materials.length > 0) {
        materials = await Promise.all(updateBody.materials.map(async (x) => {
          // get author for material
          // eslint-disable-next-line sonarjs/no-identical-functions
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

          // make a new source for material
          const materialSource = await Source.create({
            source_title: x.title,
            site_url: updateBody.source,
          });

          // make new material type
          const materialType = await MaterialType.create({
            type_name: x.fileType,
            type_description: x.title,
          });

          // make new material
          return Material.create({
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
      await Creation.update(originalCreation.creation_id, { ...updatedCreation });

      // sent invitation to material authors
      if (materials.length > 0) {
        await Promise.all(materials.map(async (x) => {
          // make new status
          const status = await Status.create({
            status_name: 'pending',
            status_description: x.material_description,
          });

          // make new invite
          const invitation = await Invitation.create({
            invite_from: originalCreation.author_id,
            invite_to: x.author_id,
            invite_description: x.material_description,
            status_id: status.status_id,
          });

          // update material with invitation id
          await Material.update(x.material_id, {
            invite_id: invitation.invite_id,
          });
        }));
      }

      // delete extra source
      await Source.delete(originalCreation.source_id);

      // delete extra materials
      await Promise.all(originalCreation.materials.map(
        async (materialId) => await Material.delete(materialId),
      ));

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
  }, [originalCreation, transformedCreation, tagSuggestions, authorSuggestions]);

  const getCreationDetails = async (id) => {
    try {
      setIsFetchingCreation(true);

      // get creation
      const toPopulate = ['source_id', 'author_id', 'materials', 'materials.type_id', 'materials.source_id', 'materials.author_id', 'tags'];
      const responseCreation = await Creation.getById(id, toPopulate.map((x) => `populate=${x}`).join('&'));

      // transform creation
      const temporaryTransformedCreation = {
        id: responseCreation.creation_id,
        date: moment(responseCreation.creation_date).format('YYYY-MM-DD'),
        description: responseCreation.creation_description,
        title: responseCreation.creation_title,
        is_draft: responseCreation.is_draft,
        author: responseCreation.author.user_name,
        source: responseCreation.source.site_url,
        tags: responseCreation.tags.map((tag) => tag.tag_name),
        materials: responseCreation.materials.map((material) => (
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
    loading,
    newCreationStatus,
    makeNewCreation,
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

export default useCreationForm;
