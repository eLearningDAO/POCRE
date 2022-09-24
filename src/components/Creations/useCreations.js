import { useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../config';

// get auth user
const user = JSON.parse(Cookies.get('activeUser') || '{}');

const useCreations = () => {
  const [loading, setLoading] = useState(false);
  const [creations, setCreations] = useState({});
  const [fetchCreationStatus, setFetchCreationStatus] = useState({
    success: false,
    error: null,
  });

  const fetchCreations = useCallback(async () => {
    try {
      setLoading(true);

      // get creations
      let creationResponse = await fetch(
        `${API_BASE_URL}/creations?page=${1}&limit=100&descend_fields[]=creation_date&query=${user.user_id}&search_fields[]=author_id`,
      )
        .then((x) => x.json());

      if (creationResponse.code === 400) throw new Error('Failed to fetch creations');

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
      setCreations(creationResponse);
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
      setLoading(false);
    }
  }, []);

  return {
    loading,
    fetchCreationStatus,
    fetchCreations,
    creations,
  };
};

export default useCreations;
