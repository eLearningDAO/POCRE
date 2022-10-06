import create from 'zustand';

const useUserInfo = create((set, get) => ({
  login: false,
  user: null,
  setUser: (function_) => {
    set(function_(get()));
  },
}));

export default useUserInfo;
