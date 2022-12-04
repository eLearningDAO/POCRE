import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Creation } from 'api/requests';
import { useState } from 'react';

const useDetails = () => {
  const queryClient = useQueryClient();
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
  });

  // delete creation
  const {
    mutate: deleteCreation,
    isError: isDeleteError,
    isSuccess: isDeleteSuccess,
    isLoading: isDeletingCreation,
    reset: resetDeletionErrors,
  } = useMutation({
    mutationFn: async () => {
      await Creation.delete(creationId);

      // update queries
      queryClient.cancelQueries({ queryKey: ['creations'] });
      queryClient.setQueryData(['creations'], (data) => {
        if (data && data.results) {
          const temporaryCreations = data.results.filter((x) => x?.creation_id !== creationId);

          return { ...data, results: [...temporaryCreations] };
        }
        return data;
      });
    },
  });

  return {
    isFetchingCreation,
    fetchCreationStatus: {
      success: isFetchSuccess,
      error: isFetchError ? 'Failed to fetch creation' : null,
    },
    creation,
    fetchCreationDetails: (id) => setCreationId(id),
    deleteCreationStatus: {
      success: isDeleteSuccess,
      error: isDeleteError ? 'Failed to delete creation' : null,
    },
    deleteCreation,
    resetDeletionErrors,
    isDeletingCreation,
  };
};

export default useDetails;
