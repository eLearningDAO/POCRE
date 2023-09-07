import Cookies from 'js-cookie';
import localData from 'hydraDemo/util/localData';

const walletAddressKey = 'walletAddress';
const sessionWalletAddress = {
  get: () => JSON.parse(window.sessionStorage.getItem(walletAddressKey)),
  set: (address) => window.sessionStorage.setItem(walletAddressKey, JSON.stringify(address)),
};

const getUser = () => localData.users.getByWalletAddress(sessionWalletAddress.get());

const getAllUsers = () => localData.users.fetchAll({ asList: true });

const setUser = (user) => {
  sessionWalletAddress.set(user.walletAddress);

  // All users that sign in will be tracked locally for the purpose of the hydra demo.
  // These users will be used for assigning jury keys.
  localData.users.save(user);
};

const removeUser = () => localData.users.deleteById(sessionWalletAddress.get());

const getJWTToken = () => Cookies.get('jwttoken');

const setJWTToken = (token, options = {}) => Cookies.set(
  'jwttoken',
  token,
  options,
);

const removeJWTToken = () => Cookies.remove('jwttoken');

export default {
  getUser,
  getAllUsers,
  setUser,
  removeUser,
  setJWTToken,
  getJWTToken,
  removeJWTToken,
};
