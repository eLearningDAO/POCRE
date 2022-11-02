import { useCallback, useState } from 'react';
import { API_BASE_URL } from 'config';

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
      const toPopulate = [
        'source_id',
        'author_id',
        'tags',
        'materials',
        'materials.source_id',
        'materials.type_id',
        'materials.invite_id',
        'materials.invite_id.invite_from',
        'materials.invite_id.invite_to',
        'materials.invite_id.status_id',
        'materials.author_id',
      ];
      const creationResponse = await fetch(`${API_BASE_URL}/creations/${id}?${toPopulate.map((x) => `populate=${x}`).join('&')}`).then((x) => x.json());
      if (creationResponse.code >= 400) throw new Error('Failed to fetch creation');

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
