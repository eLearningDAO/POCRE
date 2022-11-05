import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Creation } from 'api/requests';
import Cookies from 'js-cookie';

// get auth user
const user = JSON.parse(Cookies.get('activeUser') || '{}');

const useCreations = () => {
  const queryClient = useQueryClient();

  // get creations
  const {
    data: creations,
    isError: isFetchError,
    isSuccess: isFetchSuccess,
    isLoading: isLoadingCreations,
  } = useQuery({
    queryKey: ['creations'],
    queryFn: async () => {
      const toPopulate = ['source_id', 'author_id', 'materials', 'materials.source_id', 'materials.type_id', 'materials.author_id'];
      return await Creation.getAll(
        `page=${1}&limit=100&descend_fields[]=creation_date&query=${user.user_id}&search_fields[]=author_id&${toPopulate.map((x) => `populate=${x}`).join('&')}`,
      );
    },
    staleTime: 60_000, // cache for 60 seconds
  });

  // delete creation
  const {
    mutate: deleteCreation,
    isError: isDeleteError,
    isSuccess: isDeleteSuccess,
    isLoading: isDeletingCreation,
    reset: resetDeletionErrors,
  } = useMutation({
    mutationFn: async (creationId) => {
      await Creation.delete(creationId);

      // update queries
      queryClient.cancelQueries({ queryKey: ['creations'] });
      queryClient.setQueryData(['creations'], (data) => {
        const temporaryCreations = data.results.filter((x) => x?.creation_id !== creationId);

        return { ...data, results: [...temporaryCreations] };
      });
    },
  });

  return {
    isLoadingCreations,
    isDeletingCreation,
    fetchCreationStatus: {
      success: isFetchSuccess,
      error: isFetchError ? 'Failed to fetch creations' : null,
    },
    deleteCreationStatus: {
      success: isDeleteSuccess,
      error: isDeleteError ? 'Failed to delete creation' : null,
    },
    deleteCreation,
    resetDeletionErrors,
    creations,
  };
};

export default useCreations;
