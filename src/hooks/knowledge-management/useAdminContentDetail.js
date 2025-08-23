import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminKnowledgeContentDetail,
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

export const useUpdateContentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminKnowledgeContentStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["admin-knowledge-content-detail", variables.id]);
      queryClient.invalidateQueries(["fetch-knowledge-admin-contents"]);
      message.success("Status konten berhasil diperbarui");
    },
    onError: (error) => {
      message.error("Gagal memperbarui status konten");
      console.error("Error updating content status:", error);
    },
  });
};