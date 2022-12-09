import { useQuery } from '@tanstack/react-query';
import { Creation } from 'api/requests';
import { useState } from 'react';

const useDetails = () => {
  const [creationId, setCreationId] = useState(null);

  // get creation details
  const {
    data: creation,
    isError: isFetchError,
    isSuccess: isFetchSuccess,
    isLoading: isFetchingCreation,
  } = useQuery({
    queryKey: [`creations-${creationId}`],
    queryFn: async () => {
      const toPopulate = [
        'author_id', 'tags', 'materials', 'materials.recognition_id', 'materials.recognition_id.recognition_by',
        'materials.recognition_id.recognition_for', 'materials.author_id',
      ];
      return await Creation.getById(creationId, toPopulate.map((x) => `populate=${x}`).join('&'));
    },
    enabled: !!creationId,
    staleTime: 60_000, // cache for 60 seconds
  });

  return {
    isFetchingCreation,
    fetchCreationStatus: {
      success: isFetchSuccess,
      error: isFetchError ? 'Failed to fetch creation' : null,
    },
    creation,
    fetchCreationDetails: (id) => setCreationId(id),
  };
};

export default useDetails;
