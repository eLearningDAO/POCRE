import Cookies from 'js-cookie';
import { makeLocalStorageManager } from 'hydraDemo/util/localStorage';

const storageManager = makeLocalStorageManager({ storageKey: 'users', idField: 'walletAddress' });

const walletAddressKey = 'walletAddress';
const sessionWalletAddress = {
  get: () => JSON.parse(window.sessionStorage.getItem(walletAddressKey)),
  set: (address) => window.sessionStorage.setItem(walletAddressKey, JSON.stringify(address)),
};

const getUser = () => storageManager.getById(sessionWalletAddress.get());

const getAllUsers = () => storageManager.fetchAll();

const setUser = (user) => {
  sessionWalletAddress.set(user.walletAddress);

  // All users that sign in will be tracked locally for the purpose of the hydra demo.
  // These users will be used for assigning jury keys.
  storageManager.save(user);
};

const removeUser = () => storageManager.deleteById(sessionWalletAddress.get());

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
