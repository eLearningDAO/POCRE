import Cookies from 'js-cookie';

const get = () => {
  const user = Cookies.get('authUser');
  return typeof user === 'string' ? JSON.parse(user) : user;
};

const set = (user, options = {}) => Cookies.set(
  'authUser',
  JSON.stringify({ ...user }),
  options,
);

const remove = () => Cookies.remove('authUser');

export default {
  get,
  set,
  remove,
};
