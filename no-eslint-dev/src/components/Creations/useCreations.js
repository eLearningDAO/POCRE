import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';
import { API_BASE_URL } from '../../config';

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
      let creationResponse = await fetch(
        `${API_BASE_URL}/creations?page=${1}&limit=100&descend_fields[]=creation_date&query=${user.user_id}&search_fields[]=author_id`,
      )
        .then((x) => x.json());

      if (creationResponse.code >= 400) throw new Error('Failed to fetch creations');

      // get source for each creation
      creationResponse = {
        ...creationResponse,
        results: await Promise.all(creationResponse?.results?.map(async (x) => {
          const creation = { ...x };

          const source = await fetch(
            `${API_BASE_URL}/source/${x.source_id}`,
          ).then((y) => y.json()).catch(() => null);

          delete creation.source_id;

          return {
            ...creation,
            title: creation.title + creation.creation_id,
            source,
          };
        })),
      };

      setFetchCreationStatus({
        success: true,
        error: null,
      });
      setCreations({ ...creationResponse });

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
