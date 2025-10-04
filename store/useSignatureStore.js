import create from "zustand";

const useSignatureStore = create((set) => ({
  signCoordinates: [],
  setSignCoordinates: (coordinates) => set({ signCoordinates: coordinates }),
  clearSignCoordinates: () => set({ signCoordinates: [] }),
}));

export default useSignatureStore;
