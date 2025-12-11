import { create } from "zustand";

interface UIStore {
  isSearchModalOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  toggleSearchModal: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  isSearchModalOpen: false,
  openSearchModal: () => set({ isSearchModalOpen: true }),
  closeSearchModal: () => set({ isSearchModalOpen: false }),
  toggleSearchModal: () =>
    set((state) => ({ isSearchModalOpen: !state.isSearchModalOpen }))
}));
