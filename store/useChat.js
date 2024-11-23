import { create } from "zustand";

const useChatStore = create((set) => ({
  lastId: null,
  setLastId: (lastId) => set({ lastId }),
  sendSuccess: false,
  setSendSuccess: (sendSuccess) => set({ sendSuccess }),
}));

export default useChatStore;
