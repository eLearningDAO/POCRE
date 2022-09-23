import { useState, useCallback } from 'react';
import { API_BASE_URL } from '../../config';

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
      const creationResponse = await fetch(
        `${API_BASE_URL}/creations?page=${1}`,
      )
        .then((x) => x.json());

      if (creationResponse.code === 400) throw new Error('Failed to fetch creations');

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
