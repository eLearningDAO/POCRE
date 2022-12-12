import { useMutation } from '@tanstack/react-query';
import { User } from 'api/requests';
import authUser from 'utils/helpers/authUser';

const useProfile = () => {
  // update user profile
  const {
    mutate: updateUserProfile,
    isLoading: isUpdatingUserProfile,
    isError: isUpdateProfileError,
    isSuccess: isUpdateProfileSuccess,
    reset: resetUserProfileStatus,
  } = useMutation({
    mutationFn: async (updateBody) => {
      /**
       * IMPORTANT: this is a kindof hack
       * NOTE: since we dont store files on the backend, we are just uploading
       * the selected image (if any) to a third party and sending the response url
       * to our api
      */
      if (updateBody?.avatarImageFile) {
        const formData = new FormData();
        formData.append('file', updateBody.avatarImageFile);
        formData.append('upload_preset', 'zqrypurh');
        const response = await fetch('https://api.cloudinary.com/v1_1/dia0ztihb/image/upload', {
          method: 'POST',
          body: formData,
        })
          .then((x) => x.json())
          .catch(() => null);

        // eslint-disable-next-line no-param-reassign
        updateBody.image_url = response.url;
        // eslint-disable-next-line no-param-reassign
        delete updateBody.avatarImageFile;
      }

      const response = await User.update(authUser.getUser().user_id, updateBody);
      authUser.setUser({ ...authUser.getUser(), ...response }); // update user in cookies
    },
  });

  return {
    updateUserProfile,
    isUpdatingUserProfile,
    updateUserProfileStatus: {
      success: isUpdateProfileSuccess,
      error: isUpdateProfileError ? 'Failed to update profile' : null,
    },
    resetUserProfileStatus,
  };
};

export default useProfile;
