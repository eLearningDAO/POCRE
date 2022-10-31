import create from 'zustand';
import { persist } from 'zustand/middleware';

const useUserInfo = create(
  persist((set, get) => ({
    login: false,
    flag: 0,
    setUser: (function_) => {
      set(function_(get()));
    },
    setFlag: () => set((state) => ({ flag: state.flag + 1 })),
    eraseFlag: () => set(() => ({ flag: 0 })),
  }), {
    name: 'userInfo',

  }),
);

export default useUserInfo;
