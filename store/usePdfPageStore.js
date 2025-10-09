import create from "zustand";

/**
 * Zustand store for PDF page sizes
 * Store page dimensions for each document and page number
 */
const usePdfPageStore = create((set, get) => ({
  // Format: { documentId: { pageNumber: { width, height } } }
  pageSizes: {},

  /**
   * Set page size for a specific document and page
   * @param {string} documentId - Document identifier
   * @param {number} pageNumber - Page number (1-based)
   * @param {Object} size - { width, height }
   */
  setPageSize: (documentId, pageNumber, size) =>
    set((state) => ({
      pageSizes: {
        ...state.pageSizes,
        [documentId]: {
          ...(state.pageSizes[documentId] || {}),
          [pageNumber]: size,
        },
      },
    })),

  /**
   * Get page size for a specific document and page
   * @param {string} documentId
   * @param {number} pageNumber
   * @returns {Object|null} { width, height } or null
   */
  getPageSize: (documentId, pageNumber) => {
    const state = get();
    return state.pageSizes[documentId]?.[pageNumber] || null;
  },

  /**
   * Get all page sizes for a document
   * @param {string} documentId
   * @returns {Object} { pageNumber: { width, height } }
   */
  getDocumentPageSizes: (documentId) => {
    const state = get();
    return state.pageSizes[documentId] || {};
  },

  /**
   * Clear page sizes for a specific document
   * @param {string} documentId
   */
  clearDocumentPageSizes: (documentId) =>
    set((state) => {
      const newPageSizes = { ...state.pageSizes };
      delete newPageSizes[documentId];
      return { pageSizes: newPageSizes };
    }),

  /**
   * Clear all page sizes
   */
  clearAllPageSizes: () => set({ pageSizes: {} }),
}));

export default usePdfPageStore;
