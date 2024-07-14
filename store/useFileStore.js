import create from "zustand";

const useFileStore = create((set) => ({
  fileList: null,
  setFileList: (fileList) => set({ fileList }),
}));

export default useFileStore;
