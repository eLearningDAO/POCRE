import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';
import { Creation, Material, Source } from 'api/requests';

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
      const creationResponse = await Creation.getAll(
        `page=${1}&limit=100&descend_fields[]=creation_date&query=${user.user_id}&search_fields[]=author_id&${toPopulate.map((x) => `populate=${x}`).join('&')}`,
      );

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
      await Creation.delete(creation?.creation_id);

      // delete creation materials
      if ((creation?.materials || [])?.length > 0) {
        await Promise.all(
          creation?.materials?.map(
            async (materialId) => await Material.delete(materialId),
          ),
        );
      }

      // delete creation source
      await Source.delete(creation?.source?.source_id);

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
