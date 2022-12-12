import { useMutation } from '@tanstack/react-query';
import { Auth } from 'api/requests';
import { useState } from 'react';
import authUser from 'utils/helpers/authUser';
import { getAvailableWallets, getWalletAddress } from 'utils/helpers/wallet';

const useLoginModal = () => {
  const [walletAddressError, setWalletAddressError] = useState(null);
  const [loadingWalletAddress, setLoadingWalletAddress] = useState(null);
  const [selectedWalletAddressOriginal, setSelectedWalletAddressOriginal] = useState(null);
  const [selectedWalletAddressHashed, setSelectedWalletAddressHashed] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);

  const getWalletsList = () => setAvailableWallets(getAvailableWallets());

  const getSelectedWalletAddress = async (wallet) => {
    try {
      setSelectedWalletAddressHashed(null);
      setLoadingWalletAddress(true);
      setWalletAddressError(null);

      // get wallet address from browser
      const walletAddress = await getWalletAddress(wallet);

      // if wallet address is not found
      if (!walletAddress) { setWalletAddressError('Cannot login with this wallet!'); return; }

      setSelectedWalletAddressOriginal(walletAddress);
      setSelectedWalletAddressHashed(`${walletAddress.slice(0, 10)}..........${walletAddress.slice(-10)}`);
    } catch {
      setWalletAddressError('Cannot login with this wallet!'); return;
    } finally {
      setLoadingWalletAddress(false);
    }
  };

  const {
    mutate: loginWithWallet,
    error: loginError,
    isSuccess: loginSuccess,
    isLoading: isLoggingIn,
  } = useMutation({
    mutationFn: async () => {
      // login with wallet
      const response = await Auth.login({ wallet_address: selectedWalletAddressOriginal });
      authUser.setUser({ ...response.user, hashedWalletAddress: selectedWalletAddressHashed });
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

export default useLoginModal;
