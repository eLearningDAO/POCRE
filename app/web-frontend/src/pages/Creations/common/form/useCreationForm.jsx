import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Creation, Material, Tag, User,
} from 'api/requests';
import useSuggestions from 'hooks/useSuggestions';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import publishPlatforms from 'utils/constants/publishPlatforms';
import authUser from 'utils/helpers/authUser';
import { transactADAToPOCRE } from 'utils/helpers/wallet';
import { IPFS_BASE_URL, CHARGES, TRANSACTION_PURPOSES } from 'config';

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
      const authorName = x?.author?.[0]?.trim();

      // get author for material
      const author = await (async () => {
        let temporaryAuthor = null;

        // invite user by email address
        if (authorName.includes('invite-via-')) {
          const invite = authorName.split('invite-via-')[1].split(':')?.filter((y) => !!y);

          const method = invite?.[0]?.trim();
          const username = invite.length === 3 ? invite?.[1]?.trim() : null;
          const value = invite?.[invite.length - 1]?.trim();

          // invite author by email
          temporaryAuthor = await User.invite({
            invite_method: method?.trim(),
            invite_value: value?.trim(),
            ...(username && { user_name: username?.trim() }),
          });

          return temporaryAuthor;
        }

        // check if its the creation author trying to own material
        const user = authUser.getUser();
        if (authorName === `${user?.user_name} (You)`) {
          return user;
        }

        // return if author found from suggestions
        temporaryAuthor = authorSuggestions.find(
          (suggestion) => suggestion.user_name.trim() === authorName,
        );
        if (temporaryAuthor) return temporaryAuthor;

        // find if the author exists in db
        temporaryAuthor = await User.getAll(`query=${authorName}&search_fields[]=user_name`);
        temporaryAuthor = temporaryAuthor?.results?.[0] || null;
        if (temporaryAuthor) return temporaryAuthor;

        // make new author
        temporaryAuthor = await User.create({
          user_name: authorName,
        });

        return temporaryAuthor;
      })();

      // make new material
      const material = await Material.create({
        material_title: x.title,
        material_link: x.link,
        author_id: author.user_id,
      });

      return { ...material };
    }));
  }

  return { tags, materials };
};

const publishIPFSCreationOnChain = async (creationId) => {
  const creationOnIPFS = await Creation.publish(creationId, {
    publish_on: publishPlatforms.IPFS,
  });

  // make transaction to store ipfs on chain
  await transactADAToPOCRE({
    amountADA: CHARGES.CREATION.PUBLISHING_ON_IPFS,
    purposeDesc: TRANSACTION_PURPOSES.CREATION.PUBLISHING_ON_IPFS,
    walletName: authUser.getUser()?.selectedWallet,
    metaData: {
      ipfsHash: creationOnIPFS.ipfs_hash,
      ipfsURL: IPFS_BASE_URL,
    },
  });
};

const addStarToAuthorSuggesstion = (authorNameSuggestions) => {
  const user = authUser.getUser();
  const authorSuggestionsNew = [];
  authorNameSuggestions.map(
    (author) => {
      if (author.reputation_stars) {
        let authorName = `${author.user_name}${user.user_id === author?.user_id ? ' (You)-' : '-'}`;
        authorName += '★'.repeat(author.reputation_stars);
        authorSuggestionsNew.push(authorName);
      } else {
        const authorName = `${author.user_name}${user.user_id === author?.user_id ? ' (You)' : ''}`;
        authorSuggestionsNew.push(authorName);
      }
      return true;
    },
  );
  return authorSuggestionsNew;
};

const useCreationForm = ({
  onCreationFetch = () => {},
}) => {
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
        date: moment(responseCreation.creation_date).format('YYYY-MM-DD'), // moment auto converts utc to local time
        description: responseCreation.creation_description,
        title: responseCreation.creation_title,
        is_draft: responseCreation.is_draft,
        author: responseCreation.author.user_name,
        source: responseCreation.creation_link,
        ipfsHash: responseCreation.ipfs_hash,
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

  // trigger the callback when a creation is fetched
  useEffect(() => {
    if (creation) onCreationFetch(creation);
  }, [creation]);

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
      const newCreation = await Creation.create({
        creation_title: creationBody.title,
        creation_description: creationBody.description,
        creation_link: creationBody.source,
        tags: tags.map((tag) => tag.tag_id),
        ...(materials.length > 0 && { materials: materials.map((x) => x.material_id) }),
        creation_date: new Date(creationBody.date).toISOString(), // send date in utc
        is_draft: creationBody.is_draft,
      });

      // upload to ipfs if not draft
      if (!newCreation.is_draft && !newCreation.ipfs_hash) {
        await publishIPFSCreationOnChain(newCreation.creation_id);
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
        creation_date: new Date(updateBody.date).toISOString(), // send date in utc
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

      // upload to ipfs
      await publishIPFSCreationOnChain(creation.original.creation_id);

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
    addStarToAuthorSuggesstion,
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
