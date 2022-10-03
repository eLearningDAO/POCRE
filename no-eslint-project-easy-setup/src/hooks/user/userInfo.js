import create from "zustand";

const useUserInfo = create((set, get) => ({
  user: null,
  setUser: (fn) => {
    set({ user: fn(get().user) });
    return { user: get().user };
  },
}));

export default useUserInfo;
