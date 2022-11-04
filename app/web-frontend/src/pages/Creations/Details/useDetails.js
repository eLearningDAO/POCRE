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
        'source_id', 'author_id', 'tags', 'materials', 'materials.source_id', 'materials.type_id', 'materials.invite_id',
        'materials.invite_id.invite_from', 'materials.invite_id.invite_to', 'materials.invite_id.status_id', 'materials.author_id',
      ];
      return await Creation.getById(creationId, toPopulate.map((x) => `populate=${x}`).join('&'));
    },
    enabled: !!creationId,
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
