import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReferensiBadges,
  createReferensiBadge,
  updateReferensiBadge,
  deleteReferensiBadge,
} from "@/services/knowledge-management.services";
import { message } from "antd";

export const useFetchBadges = () => {
  return useQuery({
    queryKey: ["knowledge-badges"],
    queryFn: getReferensiBadges,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateBadge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReferensiBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-badges"] });
      message.success("Badge berhasil dibuat");
    },
    onError: (error) => {
      message.error("Gagal membuat badge");
      console.error("Error creating badge:", error);
    },
  });
};

export const useUpdateBadge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReferensiBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-badges"] });
      message.success("Badge berhasil diupdate");
    },
    onError: (error) => {
      message.error("Gagal mengupdate badge");
      console.error("Error updating badge:", error);
    },
  });
};

export const useDeleteBadge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReferensiBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-badges"] });
      message.success("Badge berhasil dihapus");
    },
    onError: (error) => {
      message.error("Gagal menghapus badge");
      console.error("Error deleting badge:", error);
    },
  });
};
