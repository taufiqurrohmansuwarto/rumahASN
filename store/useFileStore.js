import create from "zustand";

const useFileStore = create((set) => ({
  fileList: [],
  setFileList: (fileList) => set({ fileList }),
}));

export default useFileStore;
