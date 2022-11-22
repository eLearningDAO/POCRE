import { useMutation, useQuery } from '@tanstack/react-query';
import { User, Creation } from 'api/requests';
import { useState } from 'react';

const useWallet = () => {
  const [userId, setUserId] = useState(null);
  const {
    data: userData,
  } = useQuery({
    queryKey: ['userById'],
    queryFn: async () => {
      const userResponse = await User.getById(userId);
      return {
        name: userResponse.user_name,
        email: userResponse.email_address,
        phone: userResponse.phone,
        bio: userResponse.user_bio,
        walletAddress: userResponse.wallet_address,
        walletType: userResponse.verified_id,
        reputationStars: userResponse.reputation_stars,
        imageUrl: userResponse.image_url,
      };
    },
    enabled: !!userId,
  });

  const {
    data: userCollectionCount,
  } = useQuery({
    queryKey: ['userCollectionById'],
    queryFn: async () => {
      const userCollectionResponse = await Creation.getById(userId);
      return userCollectionResponse.results.length;
    },
    enabled: !!userId,
  });
  const {
    mutate: uploadUserImage,
    data: userProfileImageUrl,
    isLoading: isImageUploaded,
  } = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'zqrypurh');
      const requestOptions = {
        method: 'POST',
        body: formData,
      };
      const userProfileImageUpload = await fetch('https://api.cloudinary.com/v1_1/dia0ztihb/image/upload', requestOptions)
        .then((response) => response.json());
      return userProfileImageUpload.url;
    },
  });

  const {
    mutate: updateUser,
    isLoading: isUserDataUpdating,
  } = useMutation({
    mutationFn: async (userInfo) => {
      const id = userInfo.user_Id;
      // eslint-disable-next-line  no-param-reassign
      delete userInfo.user_Id;
      const userResponse = await User.update(id, userInfo);
      return userResponse.results;
    },
  });

  return {
    userData,
    uploadUserImage,
    userCollectionCount,
    userProfileImageUrl,
    isImageUploaded,
    updateUser,
    isUserDataUpdating,
    fetchUserDetailsById: (id) => setUserId(id),
  };
};

export default useWallet;
