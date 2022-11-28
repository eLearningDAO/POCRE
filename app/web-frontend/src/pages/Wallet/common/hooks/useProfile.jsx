import { useQuery } from '@tanstack/react-query';
import { Creation, User } from 'api/requests';
import { useState } from 'react';

const useProfile = () => {
  const [userId, setUserId] = useState(null);

  // get user profile
  const {
    data: userProfile,
    isError: isFetchUserProfileError,
    isSuccess: isFetchUserProfileSuccess,
    isLoading: isFetchingUserProfile,
  } = useQuery({
    queryKey: [`user-wallet-profile-${userId}`],
    queryFn: async () => {
      const responseProfile = await User.getById(userId);

      const responseCreationsCount = (await Creation.getAll(`query=${userId}&search_fields[]=author_id&limit=1`));

      return {
        name: responseProfile.user_name,
        email: responseProfile.email_address,
        phone: responseProfile.phone,
        bio: responseProfile.user_bio,
        reputationStars: responseProfile.reputation_stars,
        imageUrl: responseProfile.image_url,
        totalCreationsAuthored: responseCreationsCount?.total_results || 0,
      };
    },
    enabled: !!userId,
  });

  return {
    // get user profile
    fetchUserProfile: (id) => setUserId(id),
    userProfile,
    isFetchingUserProfile,
    fetchUserProfileStatus: {
      success: isFetchUserProfileSuccess,
      error: isFetchUserProfileError ? 'Failed to get profile' : null,
    },
  };
};

export default useProfile;
