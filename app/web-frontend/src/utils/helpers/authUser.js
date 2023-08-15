import Cookies from 'js-cookie';
import { makeLocalStorageManager } from 'hydraDemo/util/localStorage';

const storageManager = makeLocalStorageManager({ storageKey: 'users', idField: 'walletAddress' });

// A hacky way to keep track of the currently signed in user without changing the API of this module
let walletAddress;

const getUser = () => storageManager.getById(walletAddress);

const getAllUsers = () => storageManager.fetchAll();

const setUser = (user) => {
  walletAddress = user.walletAddress;

  // All users that sign in will be tracked locally for the purpose of the hydra demo.
  // These users will be used for assigning jury keys.
  storageManager.save(user);
};

const removeUser = () => storageManager.deleteById(walletAddress);

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
