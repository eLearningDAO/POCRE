import { useCallback, useState } from 'react';
import { API_BASE_URL } from '../../../config';

const useDetails = () => {
  const [isFetchingCreation, setIsFetchingCreation] = useState(false);
  const [creation, setCreation] = useState(null);
  const [fetchCreationStatus, setFetchCreationStatus] = useState({
    success: false,
    error: null,
  });

  const fetchCreationDetails = useCallback(async (id) => {
    try {
      setIsFetchingCreation(true);

      // get creation details
      const creationResponse = await fetch(`${API_BASE_URL}/creations/${id}`).then((x) => x.json());
      if (creationResponse.code >= 400) throw new Error('Failed to fetch creation');

      // get details about creation author
      const author = await fetch(`${API_BASE_URL}/users/${creationResponse.author_id}`).then((x) => x.json());
      creationResponse.author = author;
      delete creationResponse.author_id;

      // get details about creation creation source
      const source = await fetch(`${API_BASE_URL}/source/${creationResponse.source_id}`).then((x) => x.json());
      creationResponse.source = source;
      delete creationResponse.source_id;

      // get details about creation invitation
      const materials = await Promise.all(creationResponse.materials.map(
        // eslint-disable-next-line no-return-await
        async (materialId) => {
          const material = await fetch(`${API_BASE_URL}/materials/${materialId}`).then((x) => x.json());

          // material author
          const materialAuthor = await fetch(`${API_BASE_URL}/users/${material.author_id}`).then((x) => x.json());
          material.author = materialAuthor;
          delete material.author_id;

          // material type
          const materialType = await fetch(`${API_BASE_URL}/material-type/${material.type_id}`).then((x) => x.json());
          material.type = materialType;
          delete material.type_id;

          // material invite
          if (material.invite_id) {
            const invite = await fetch(`${API_BASE_URL}/invitations/${material.invite_id}`).then((x) => x.json());

            const status = await fetch(`${API_BASE_URL}/status/${invite.status_id}`).then((x) => x.json());
            invite.status = status;
            delete invite.status_id;

            material.invite = invite;
            delete material.invite_id;
          }

          return material;
        },
      ));
      creationResponse.materials = materials;

      // get details about creation invitation
      const tags = await Promise.all(creationResponse.tags.map(
        // eslint-disable-next-line no-return-await
        async (tagId) => await fetch(`${API_BASE_URL}/tags/${tagId}`).then((x) => x.json()),
      ));
      creationResponse.tags = tags;

      setFetchCreationStatus({
        success: true,
        error: null,
      });
      setCreation({ ...creationResponse });
      setTimeout(() => setFetchCreationStatus({
        success: false,
        error: null,
      }), 3000);
    } catch {
      setFetchCreationStatus({
        success: false,
        error: 'Failed to fetch creation',
      });
    } finally {
      setIsFetchingCreation(false);
    }
  }, []);

  return {
    isFetchingCreation,
    fetchCreationStatus,
    creation,
    fetchCreationDetails,
  };
};

export default useDetails;
