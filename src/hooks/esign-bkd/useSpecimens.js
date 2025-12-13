import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserSpecimens,
  getActiveSpecimen,
  uploadSpecimen,
  deleteSpecimen,
  activateSpecimen,
  updateSpecimen,
  createSpecimenFormData,
  checkUserSpecimen,
} from "@/services/esign-bkd.services";

// Query Keys
export const SPECIMEN_KEYS = {
  all: ["esign-bkd", "specimens"],
  list: () => [...SPECIMEN_KEYS.all, "list"],
  active: () => [...SPECIMEN_KEYS.all, "active"],
  check: (userId) => [...SPECIMEN_KEYS.all, "check", userId],
};

// Get all specimens
export const useSpecimens = () => {
  return useQuery({
    queryKey: SPECIMEN_KEYS.list(),
    queryFn: async () => {
      try {
        return await getUserSpecimens();
      } catch (error) {
        // Return empty data if API fails (e.g., table doesn't exist yet)
        console.warn("[useSpecimens] Error fetching specimens:", error?.message);
        return { data: [] };
      }
    },
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// Get active specimen
export const useActiveSpecimen = () => {
  return useQuery({
    queryKey: SPECIMEN_KEYS.active(),
    queryFn: async () => {
      try {
        return await getActiveSpecimen();
      } catch (error) {
        // Return null data if API fails (e.g., table doesn't exist yet)
        console.warn("[useActiveSpecimen] Error fetching active specimen:", error?.message);
        return { data: null };
      }
    },
    refetchOnWindowFocus: false,
    retry: false, // Don't retry on error
  });
};

// Upload specimen
export const useUploadSpecimen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, name }) => {
      const formData = createSpecimenFormData(file, name);
      return uploadSpecimen(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPECIMEN_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: SPECIMEN_KEYS.active() });
    },
  });
};

// Delete specimen
export const useDeleteSpecimen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteSpecimen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPECIMEN_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: SPECIMEN_KEYS.active() });
    },
  });
};

// Activate specimen
export const useActivateSpecimen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => activateSpecimen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPECIMEN_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: SPECIMEN_KEYS.active() });
    },
  });
};

// Update specimen name
export const useUpdateSpecimen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateSpecimen(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPECIMEN_KEYS.list() });
    },
  });
};

// Check if a user has active specimen
export const useCheckUserSpecimen = (userId, options = {}) => {
  return useQuery({
    queryKey: SPECIMEN_KEYS.check(userId),
    queryFn: () => checkUserSpecimen(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    ...options,
  });
};

