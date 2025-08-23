import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReferensiKategori,
  createReferensiKategori,
  updateReferensiKategori,
  deleteReferensiKategori,
} from "@/services/knowledge-management.services";
import { message } from "antd";

export const useFetchCategories = () => {
  return useQuery({
    queryKey: ["knowledge-categories"],
    queryFn: getReferensiKategori,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReferensiKategori,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-categories"] });
      message.success("Kategori berhasil dibuat");
    },
    onError: (error) => {
      message.error("Gagal membuat kategori");
      console.error("Error creating category:", error);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReferensiKategori,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-categories"] });
      message.success("Kategori berhasil diupdate");
    },
    onError: (error) => {
      message.error("Gagal mengupdate kategori");
      console.error("Error updating category:", error);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReferensiKategori,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-categories"] });
      message.success("Kategori berhasil dihapus");
    },
    onError: (error) => {
      message.error("Gagal menghapus kategori");
      console.error("Error deleting category:", error);
    },
  });
};
