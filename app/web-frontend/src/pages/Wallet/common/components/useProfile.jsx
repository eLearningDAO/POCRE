import { useMutation, useQuery } from '@tanstack/react-query';
import { User, Creation } from 'api/requests';
import authUser from 'utils/helpers/authUser';
import moment from 'moment';

const user = authUser.getUser();

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

  const {
    mutate: sendVerificationEmail,
    isLoading: isSendingVerificationEmail,
    isError: isSendVerificationEmailError,
    isSuccess: isSendVerificationEmailSuccess,
  } = useMutation({
    mutationFn: async () => {
      const response = await User.verifyEmail({ user_id: authUser.getUser().user_id });
      authUser.setUser({ ...authUser.getUser(), ...response });
    },
  });

  const {
    data: creations,
  } = useQuery({
    queryKey: ['creationsProfile'],
    queryFn: async () => {
      const toPopulate = ['author_id', 'materials', 'materials.author_id'];
      const unsortedCreations = await Creation.getAll(
        `descend_fields[]=creation_date&query=${user.user_id}&search_fields[]=author_id&${toPopulate.map((x) => `populate=${x}`).join('&')}`,
      );

      // sort by latest first
      return {
        ...unsortedCreations,
        results: [...unsortedCreations.results].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        ).map((x) => ({ ...x, creation_date: moment(x?.creation_date).format('Do MMMM YYYY') })),
      };
    },
    staleTime: 60_000, // cache for 60 seconds
  });

  return {
    updateUserProfile,
    creations,
    sendVerificationEmail,
    isUpdatingUserProfile,
    isSendingVerificationEmail,
    updateUserProfileStatus: {
      success: isUpdateProfileSuccess,
      error: isUpdateProfileError ? 'Failed to update profile' : null,
    },
    verficationEmailStatus: {
      success: isSendVerificationEmailSuccess,
      error: isSendVerificationEmailError ? 'Failed to send email' : null,
    },
    resetUserProfileStatus,
  };
};

export default useProfile;
