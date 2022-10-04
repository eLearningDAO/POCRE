import create from 'zustand';

const useUserInfo = create((set, get) => ({
  user: null,
  setUser: (setFnUser) => {
    set({ user: setFnUser(get().user) });
    return { user: get().user };
  },
}));

export default useUserInfo;
