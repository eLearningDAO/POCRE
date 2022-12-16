import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Creation } from 'api/requests';

const useDetails = () => {
  const queryClient = useQueryClient();

  // delete creation
  const {
    mutate: deleteCreation,
    isError: isDeleteError,
    isSuccess: isDeleteSuccess,
    isLoading: isDeletingCreation,
    error,
    reset: resetDeletionErrors,
  } = useMutation({
    mutationFn: async (id) => {
      await Creation.delete(id);

      // update queries
      queryClient.cancelQueries({ queryKey: ['creations'] });
      queryClient.setQueryData(['creations'], (data) => {
        if (data && data.results) {
          const temporaryCreations = data.results.filter((x) => x?.creation_id !== id);

          return { ...data, results: [...temporaryCreations] };
        }
        return data;
      });
    },
  });

  return {
    deleteCreationStatus: {
      success: isDeleteSuccess ? 'Creation deleted successfully!' : null,
      error: isDeleteError ? error?.message || 'Failed to delete creation' : null,
    },
    deleteCreation,
    resetDeletionErrors,
    isDeletingCreation,
  };
};

export default useDetails;
