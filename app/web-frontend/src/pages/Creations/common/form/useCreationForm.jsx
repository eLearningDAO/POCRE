import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Creation, Material, Tag, User,
} from 'api/requests';
import { CHARGES, IPFS_BASE_URL, TRANSACTION_PURPOSES } from 'config';
import useSuggestions from 'hooks/useSuggestions';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import publishPlatforms from 'utils/constants/publishPlatforms';
import authUser from 'utils/helpers/authUser';
import { transactADAToPOCRE } from 'utils/helpers/wallet';

const makeCommonResource = async (
  requestBody = {},
  tagSuggestions = [],
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
      const authorId = await (async () => {
        if (x?.author?.id !== '__INVITED_AUTHOR__') return x?.author?.id;

        if (x?.author?.label.includes('invite-via-')) {
          const invite = x?.author?.label?.split('invite-via-')[1].split(':')?.filter((y) => !!y);

          const method = invite?.[0]?.trim();
          const username = invite.length === 3 ? invite?.[1]?.trim() : null;
          const value = invite?.[invite.length - 1]?.trim();

          // invite author by email
          const invitedUser = await User.invite({
            invite_method: method?.trim(),
            invite_value: value?.trim(),
            ...(username && { user_name: username?.trim() }),
          });

          return invitedUser?.user_id;
        }

        return null;
      })();

      // make new material
      const material = await Material.create({
        material_title: x.title,
        material_link: x.link,
        author_id: authorId,
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

const transformAuthorNameForDisplay = (author, user) => {
  let authorName = `${author.user_name}${user.user_id === author?.user_id ? ' (You)' : ''}`;
  if (author.reputation_stars) {
    authorName += ` ${'★'.repeat(author.reputation_stars)}`;
  }
  return { id: author?.user_id, label: authorName?.trim() };
};

const transformCreationForForm = (creation) => {
  const user = authUser.getUser();

  return {
    id: creation?.creation_id,
    date: moment(creation?.creation_date).format('YYYY-MM-DD'), // moment auto converts utc to local time
    description: creation?.creation_description,
    title: creation?.creation_title,
    is_draft: creation?.is_draft,
    author: creation?.author?.user_name,
    source: creation?.creation_link,
    ipfsHash: creation?.ipfs_hash,
    tags: creation?.tags?.map((tag) => tag?.tag_name),
    materials: (creation?.materials || []).map((material) => (
      {
        id: material?.material_id,
        author: transformAuthorNameForDisplay(material?.author, user),
        link: material?.material_link,
        fileType: material?.material_type,
        title: material?.material_title,
      }
    )),
  };
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
      const temporaryTransformedCreation = transformCreationForForm(responseCreation);

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
    mutate: makeCreation,
    isError: isCreationError,
    isSuccess: isCreationSuccess,
    isLoading: isCreatingCreation,
  } = useMutation({
    mutationFn: async (creationBody) => {
      // create common data
      const { tags } = await makeCommonResource(
        creationBody,
        tagSuggestions,
      );

      // make a new creation
      const newCreation = await Creation.create({
        creation_title: creationBody.title,
        creation_description: creationBody.description,
        creation_link: creationBody.source,
        tags: tags.map((tag) => tag.tag_id),
        creation_date: new Date(creationBody.date).toISOString(), // send date in utc
        is_draft: true, // create in draft and finalize after fully updated
      });

      // remove queries cache
      queryClient.invalidateQueries({ queryKey: ['creations'] });

      // redirect to update page
      navigate(`/creations/${newCreation?.creation_id}/update?step=2`);
    },
  });

  // update creation
  const {
    mutate: updateCreation,
    isError: isUpdateError,
    isSuccess: isUpdateSuccess,
    isLoading: isUpdatingCreation,
    reset: resetCreationUpdate,
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
        is_draft: updateBody.is_draft,
      };

      const { tags, materials } = await makeCommonResource(
        updateBody,
        tagSuggestions,
      );

      updatedCreation.tags = tags.map((x) => x.tag_id);
      updatedCreation.materials = (
        (updateBody.materials || []).length === 0
      ) ? [] : materials.map((x) => x.material_id);

      // update creation
      await Creation.update(creation.original.creation_id, { ...updatedCreation });

      // upload to ipfs if not draft
      if (!updateBody.is_draft) {
        await publishIPFSCreationOnChain(creation.original.creation_id);
      }

      // remove queries cache
      queryClient.invalidateQueries({ queryKey: ['creations'] });
    },
  });

  return {
    loading: isCreatingCreation,
    newCreationStatus: {
      success: isCreationSuccess,
      error: isCreationError ? 'Failed to make a new creation' : null,
    },
    makeCreation,
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
    resetCreationUpdate,
  };
};

export default useCreationForm;
