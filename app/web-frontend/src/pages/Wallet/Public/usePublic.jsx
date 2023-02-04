import { useQuery } from '@tanstack/react-query';
import { User, Creation } from 'api/requests';
import { useState } from 'react';
import moment from 'moment/moment';

const usePublic = () => {
  const [userId, setUserId] = useState(null);
  // get user details
  const {
    data: publicProfile,
    isError,
    isSuccess,
    isLoading: isFetchingPublicProfile,
  } = useQuery({
    queryKey: [`user-${userId}`],
    queryFn: async () => {
      return await User.getById(userId);
    },
    enabled: !!userId,
  });

  const {
    data: creations,
  } = useQuery({
    queryKey: ['creationsPublic'],
    queryFn: async () => {
      const toPopulate = ['author_id', 'materials', 'materials.author_id'];
      const unsortedCreations = await Creation.getAll(
        `descend_fields[]=creation_date&query=${userId}&search_fields[]=author_id&${toPopulate.map((x) => `populate=${x}`).join('&')}`,
      );

      // sort by latest first
      return {
        ...unsortedCreations,
        results: [...unsortedCreations.results].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        ).map((x) => ({ ...x, creation_date: moment(x?.creation_date).format('Do MMMM YYYY') })),
      };
    },
    enabled: !!userId,
  });

  return {
    creations,
    isFetchingPublicProfile,
    fetchPublicProfileStatus: {
      success: isSuccess,
      error: isError ? 'Failed to fetch creation' : null,
    },
    publicProfile,
    getPublicProfile: (id) => setUserId(id),
  };
};

export default usePublic;
