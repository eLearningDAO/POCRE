import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';
import { API_BASE_URL } from 'config';

// get auth user
const user = JSON.parse(Cookies.get('activeUser') || '{}');

const useCreations = () => {
  const [isLoadingCreations, setIsLoadingCreations] = useState(false);
  const [isDeletingCreation, setIsDeletingCreation] = useState(false);
  const [creations, setCreations] = useState({});
  const [fetchCreationStatus, setFetchCreationStatus] = useState({
    success: false,
    error: null,
  });
  const [deleteCreationStatus, setDeleteCreationStatus] = useState({
    success: false,
    error: null,
  });

  const fetchCreations = useCallback(async () => {
    try {
      setIsLoadingCreations(true);

      // get creations
      const toPopulate = [
        'source_id',
        'author_id',
        'materials',
        'materials.source_id',
        'materials.type_id',
        'materials.author_id',
      ];
      const creationResponse = await fetch(
        `${API_BASE_URL}/creations?page=${1}&limit=100&descend_fields[]=creation_date&query=${user.user_id}&search_fields[]=author_id&${toPopulate.map((x) => `populate=${x}`).join('&')}`,
      )
        .then((x) => x.json());

      if (creationResponse.code >= 400) throw new Error('Failed to fetch creations');

      setFetchCreationStatus({
        success: true,
        error: null,
      });
      setCreations({ ...creationResponse });
      // eslint-disable-next-line sonarjs/no-identical-functions
      setTimeout(() => setFetchCreationStatus({
        success: false,
        error: null,
      }), 3000);
    } catch {
      setFetchCreationStatus({
        success: false,
        error: 'Failed to fetch creations',
      });
    } finally {
      setIsLoadingCreations(false);
    }
  }, []);

  const deleteCreation = useCallback(async (creation) => {
    try {
      if (!creation) return;

      setIsDeletingCreation(true);

      // delete creation
      await fetch(
        `${API_BASE_URL}/creations/${creation?.creation_id}`,
        {
          method: 'DELETE',
        },
      )
        .then(() => {});

      // delete creation materials
      if ((creation?.materials || [])?.length > 0) {
        await Promise.all(
          creation?.materials?.map(
            (materialId) => fetch(
              `${API_BASE_URL}/materials/${materialId}`,
              {
                method: 'DELETE',
              },
            )
              .then(() => {}),
          ),
        );
      }

      // delete creation source
      await fetch(
        `${API_BASE_URL}/source/${creation?.source?.source_id}`,
        {
          method: 'DELETE',
        },
      )
        .then(() => {});

      setDeleteCreationStatus({
        success: true,
        error: null,
      });
      setCreations(
        {
          ...creations,
          results: [
            ...(creations?.results?.filter((x) => x?.creation_id !== creation?.creation_id) || []),
          ],
        },
      );
      // eslint-disable-next-line sonarjs/no-identical-functions
      setTimeout(() => setDeleteCreationStatus({
        success: false,
        error: null,
      }), 3000);
    } catch {
      setDeleteCreationStatus({
        success: false,
        error: 'Failed to delete creation',
      });
    } finally {
      setIsDeletingCreation(false);
    }
  }, [creations, setCreations]);

  return {
    isLoadingCreations,
    isDeletingCreation,
    fetchCreationStatus,
    deleteCreationStatus,
    setDeleteCreationStatus,
    fetchCreations,
    deleteCreation,
    creations,
  };
};

export default useCreations;
