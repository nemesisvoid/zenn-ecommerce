import { create } from 'zustand';

interface SearchStore {
  isPending: boolean;
  setIsPending: (pending: boolean) => void;
}

export const useSearchStore = create<SearchStore>(set => ({
  isPending: false,
  setIsPending: pending => set({ isPending: pending }),
}));
