import create from 'zustand';

const useUserInfo = create((set, get) => ({
  user: null,
  setUser: (setFunctionUser) => {
    set({ user: setFunctionUser(get().user) });
    return { user: get().user };
  },
}));

export default useUserInfo;
