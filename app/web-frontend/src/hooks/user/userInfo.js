import create from 'zustand';
import { persist } from 'zustand/middleware';

const useUserInfo = create(
  persist((set, get) => ({
    login: false,
    user: {},
    setUser: (function_) => {
      set(function_(get()));
    },
  }), {
    name: 'userInfo',

  }),
);

export default useUserInfo;
