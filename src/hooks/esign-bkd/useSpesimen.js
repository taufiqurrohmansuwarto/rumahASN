import { useMutation, useQuery } from "@tanstack/react-query";
import {
  generateSpesimen,
  generateSpesimenBase64,
  previewSpesimen,
  testGotenberg,
  downloadSpesimen,
} from "@/services/esign-bkd.services";

// Query Keys
export const SPESIMEN_KEYS = {
  all: ["esign-bkd", "spesimen"],
  test: () => [...SPESIMEN_KEYS.all, "test"],
};

/**
 * Test Gotenberg connection
 * Use this hook to check if Gotenberg service is running
 */
export const useTestGotenberg = () => {
  return useQuery({
    queryKey: SPESIMEN_KEYS.test(),
    queryFn: testGotenberg,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Generate spesimen PNG (text-only)
 * Returns PNG blob that can be downloaded
 */
export const useGenerateSpesimen = () => {
  return useMutation({
    mutationFn: (data) => {
      return generateSpesimen(data);
    },
  });
};

/**
 * Generate spesimen PNG as base64 (text-only)
 * Returns base64 string that can be displayed in <img>
 */
export const useGenerateSpesimenBase64 = () => {
  return useMutation({
    mutationFn: (data) => {
      return generateSpesimenBase64(data);
    },
  });
};

/**
 * Preview spesimen HTML (for debugging, text-only)
 * Returns HTML string
 */
export const usePreviewSpesimen = () => {
  return useMutation({
    mutationFn: (data) => {
      return previewSpesimen(data);
    },
  });
};

/**
 * Generate and download spesimen PNG (text-only)
 * All-in-one hook that generates and triggers download
 */
export const useGenerateAndDownload = () => {
  return useMutation({
    mutationFn: async ({ data, filename }) => {
      // Generate PNG
      const blob = await generateSpesimen(data);

      // Trigger download
      const downloadFilename = filename || `spesimen_${data.nip}_${Date.now()}.png`;
      downloadSpesimen(blob, downloadFilename);

      return { blob, filename: downloadFilename };
    },
  });
};
