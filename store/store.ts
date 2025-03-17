import { create } from "zustand";

// 1. Definisikan interface untuk store
interface Store {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

// 2. Gunakan generic untuk menentukan tipe store
const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

export default useStore;
