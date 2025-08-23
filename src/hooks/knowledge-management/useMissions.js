import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReferensiMissions,
  createReferensiMission,
  updateReferensiMission,
  deleteReferensiMission,
} from "@/services/knowledge-management.services";
import { message } from "antd";

export const useFetchMissions = () => {
  return useQuery({
    queryKey: ["knowledge-missions"],
    queryFn: getReferensiMissions,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReferensiMission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-missions"] });
      message.success("Mission berhasil dibuat");
    },
    onError: (error) => {
      message.error("Gagal membuat mission");
      console.error("Error creating mission:", error);
    },
  });
};

export const useUpdateMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReferensiMission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-missions"] });
      message.success("Mission berhasil diupdate");
    },
    onError: (error) => {
      message.error("Gagal mengupdate mission");
      console.error("Error updating mission:", error);
    },
  });
};

export const useDeleteMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReferensiMission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-missions"] });
      message.success("Mission berhasil dihapus");
    },
    onError: (error) => {
      message.error("Gagal menghapus mission");
      console.error("Error deleting mission:", error);
    },
  });
};