import create from "zustand";

/**
 * Convert pixel position to ratio (0-1)
 */
export const pixelToRatio = (pixelPos, containerSize) => ({
  x: containerSize.width > 0 ? pixelPos.x / containerSize.width : 0,
  y: containerSize.height > 0 ? pixelPos.y / containerSize.height : 0,
});

/**
 * Convert ratio (0-1) to pixel position
 */
export const ratioToPixel = (ratio, containerSize) => ({
  x: Math.round(ratio.x * containerSize.width),
  y: Math.round(ratio.y * containerSize.height),
});

/**
 * Convert pixel size to ratio (0-1)
 */
export const pixelSizeToRatio = (pixelSize, containerSize) => ({
  width: containerSize.width > 0 ? pixelSize.width / containerSize.width : 0,
  height: containerSize.height > 0 ? pixelSize.height / containerSize.height : 0,
});

/**
 * Convert ratio (0-1) to pixel size
 */
export const ratioSizeToPixel = (ratioSize, containerSize) => ({
  width: Math.round(ratioSize.width * containerSize.width),
  height: Math.round(ratioSize.height * containerSize.height),
});

const useSignatureStore = create((set) => ({
  // Signatures with ratio-based positions (main state)
  signatures: [],

  // Actions for signature management
  setSignatures: (signatures) => set({ signatures }),

  addSignature: (signature) =>
    set((state) => ({ signatures: [...state.signatures, signature] })),

  removeSignature: (signatureId) =>
    set((state) => ({
      signatures: state.signatures.filter((sig) => sig.id !== signatureId),
    })),

  removeSignaturesByPage: (page) =>
    set((state) => ({
      signatures: state.signatures.filter((sig) => sig.page !== page),
    })),

  removeSignaturesBySignerId: (signerId) =>
    set((state) => ({
      signatures: state.signatures.filter((sig) => sig.signerId !== signerId),
    })),

  updateSignaturePosition: (signatureId, page, positionRatio) =>
    set((state) => ({
      signatures: state.signatures.map((sig) =>
        sig.id === signatureId ? { ...sig, page, positionRatio } : sig
      ),
    })),

  updateSignatureSize: (signatureId, sizeRatio) =>
    set((state) => ({
      signatures: state.signatures.map((sig) =>
        sig.id === signatureId ? { ...sig, sizeRatio } : sig
      ),
    })),

  clearSignatures: () => set({ signatures: [] }),

  // Legacy: Coordinates for API (derived from signatures)
  signCoordinates: [],
  setSignCoordinates: (coordinates) => set({ signCoordinates: coordinates }),
  clearSignCoordinates: () => set({ signCoordinates: [] }),
}));

export default useSignatureStore;
