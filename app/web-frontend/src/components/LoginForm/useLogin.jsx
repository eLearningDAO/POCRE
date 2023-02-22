import { useMutation } from '@tanstack/react-query';
import { Auth } from 'api/requests';
import { useState } from 'react';
import authUser from 'utils/helpers/authUser';
import { getAvailableWallets, getWalletAddress } from 'utils/helpers/wallet';

const useLogin = ({ inviteToken = null }) => {
  const [walletAddressError, setWalletAddressError] = useState(null);
  const [loadingWalletAddress, setLoadingWalletAddress] = useState(null);
  const [selectedWalletAddressOriginal, setSelectedWalletAddressOriginal] = useState(null);
  const [selectedWalletAddressHashed, setSelectedWalletAddressHashed] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);

  const getWalletsList = async () => setAvailableWallets(await getAvailableWallets());

  const getSelectedWalletAddress = async (wallet) => {
    const walletError = process.env.REACT_APP_HOST_TYPE === 'production' ? 'Wallets connected to test networks are not allowed!' : 'Wallets connected to the main network are not allowed!';
    try {
      setSelectedWalletAddressHashed(null);
      setLoadingWalletAddress(true);
      setWalletAddressError(null);

      // get wallet address from browser
      const walletAddress = await getWalletAddress(wallet);

      // if wallet address is not found
      if (!walletAddress) { setWalletAddressError(walletError); return; }

      setSelectedWalletAddressOriginal(walletAddress);
      setSelectedWalletAddressHashed(`${walletAddress.slice(0, 10)}..........${walletAddress.slice(-10)}`);
    } catch {
      setWalletAddressError(walletError); return;
    } finally {
      setLoadingWalletAddress(false);
    }
  };

  // login with wallet
  const {
    mutate: loginWithWallet,
    error: loginError,
    isSuccess: loginSuccess,
    isLoading: isLoggingIn,
  } = useMutation({
    mutationFn: async (selectedWallet) => {
      // login with wallet
      const response = inviteToken
        ? await Auth.signup({
          invite_token: inviteToken,
          wallet_address: selectedWalletAddressOriginal,
        })
        : await Auth.login({ wallet_address: selectedWalletAddressOriginal });

      // store cookies
      authUser.setUser({
        ...response.user,
        selectedWallet: selectedWallet.wallet,
        hashedWalletAddress: selectedWalletAddressHashed,
      });
      authUser.setJWTToken(response.token);
    },
  });

  return {
    availableWallets,
    getWalletsList,
    loginWithWallet,
    getSelectedWalletAddress,
    selectedWalletAddressHashed,
    loadingWalletAddress,
    walletAddressError,
    isLoggingIn,
    loginStatus: {
      success: loginSuccess,
      error: loginError && 'Failed to login',
    },
  };
};

export default useLogin;
