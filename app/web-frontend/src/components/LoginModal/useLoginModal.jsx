import { useMutation } from '@tanstack/react-query';
import { Auth } from 'api/requests';
import { useState } from 'react';
import authUser from 'utils/helpers/authUser';
import { getAvailableWallets, getWalletAddress } from 'utils/helpers/wallet';

const useLoginModal = () => {
  const [availableWallets, setAvailableWallets] = useState([]);

  const getWalletsList = () => setAvailableWallets(getAvailableWallets());

  const {
    mutate: loginWithWallet,
    error: loginError,
    isSuccess: loginSuccess,
    isLoading: isLoggingIn,
  } = useMutation({
    mutationFn: async ({ wallet }) => {
      // get wallet address from browser
      const walletAddress = await getWalletAddress(wallet);

      // login with wallet
      const response = await Auth.login({ wallet_address: walletAddress });
      authUser.setUser(response.user);
      authUser.setJWTToken(response.token);
    },
  });

  return {
    availableWallets,
    getWalletsList,
    loginWithWallet,
    isLoggingIn,
    loginStatus: {
      success: loginSuccess,
      error: loginError && 'Failed to login',
    },
  };
};

export default useLoginModal;
