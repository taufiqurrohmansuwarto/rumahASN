import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminKnowledgeContentDetail,
  updateAdminKnowledgeContent,
  updateAdminKnowledgeContentStatus,
} from "@/services/knowledge-management.services";
import { message } from "antd";

export const useAdminContentDetail = (id) => {
  return useQuery({
    queryKey: ["admin-knowledge-content-detail", id],
    queryFn: () => getAdminKnowledgeContentDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateAdminContent = (onSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      updateAdminKnowledgeContent({ id, payload }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([
        "admin-knowledge-content-detail",
        variables.id,
      ]);
      queryClient.invalidateQueries(["fetch-knowledge-admin-contents"]);
      message.success("Konten berhasil diperbarui");
      // Call the provided onSuccess callback
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      message.error("Gagal memperbarui konten");
      console.error("Error updating admin content:", error);
    },
  });
};

export const useUpdateContentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      updateAdminKnowledgeContentStatus({ id, payload }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries([
        "admin-knowledge-content-detail",
        variables.id,
      ]);
      queryClient.invalidateQueries(["fetch-knowledge-admin-contents"]);
      message.success("Status konten berhasil diperbarui");
    },
    onError: (error) => {
      message.error("Gagal memperbarui status konten");
      console.error("Error updating content status:", error);
    },
  });
};
