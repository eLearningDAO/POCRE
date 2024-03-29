import { useMutation } from '@tanstack/react-query';
import { User } from 'api/requests';
import authUser from 'utils/helpers/authUser';

const useVerify = () => {
  const {
    mutate: confirmUserEmail,
    isLoading: isConfirmingEmail,
    isError: isConfirmEmailError,
    isSuccess: isConfirmEmailSuccess,
  } = useMutation({
    mutationFn: async ({ userId, otpCode }) => {
      const response = await User.confirmEmail(userId, `otp_code=${otpCode}`);
      authUser.setUser({ ...authUser.getUser(), ...response });
    },
  });
  return {
    confirmUserEmail,
    isConfirmingEmail,
    confirmationEmailStatus: {
      success: isConfirmEmailSuccess,
      error: isConfirmEmailError ? 'Failed to verify email' : null,
    },
  };
};

export default useVerify;
