import create from 'zustand';

const useAppKeys = create((set) => ({
  appKey: 0,
  updateAppKey: () => set((state) => ({ appKey: state.appKey + 1 })),
}));

export default useAppKeys;
