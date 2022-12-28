import { useQuery } from '@tanstack/react-query';
import { Creation } from 'api/requests';
import authUser from 'utils/helpers/authUser';

// get auth user
const user = authUser.getUser();

const useCreations = () => {
  // get creations
  const {
    data: creations,
    isError: isFetchError,
    isSuccess: isFetchSuccess,
    isLoading: isLoadingCreations,
  } = useQuery({
    queryKey: ['creations'],
    queryFn: async () => {
      const toPopulate = ['author_id', 'materials', 'materials.author_id'];
      const unsortedCreations = await Creation.getAll(
        `page=${1}&limit=100&descend_fields[]=creation_date&query=${user.user_id}&search_fields[]=author_id&${toPopulate.map((x) => `populate=${x}`).join('&')}`,
      );

      // sort by latest first
      return {
        ...unsortedCreations,
        results: [...unsortedCreations.results].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        ),
      };
    },
    staleTime: 60_000, // cache for 60 seconds
  });

  return {
    isLoadingCreations,
    fetchCreationStatus: {
      success: isFetchSuccess,
      error: isFetchError ? 'Failed to fetch creations' : null,
    },
    creations,
  };
};

export default useCreations;
