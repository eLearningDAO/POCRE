import { useQuery } from '@tanstack/react-query';
import { User } from 'api/requests';
import { useState } from 'react';

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

  return {
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
