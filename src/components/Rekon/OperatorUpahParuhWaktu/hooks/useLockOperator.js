import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  toggleLockOperatorGajiPW,
  lockAllOperatorGajiPW,
} from "@/services/siasn-services";

// Hook untuk toggle lock operator
export const useToggleLockOperator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => toggleLockOperatorGajiPW({ id, data }),
    onSuccess: () => {
      message.success("Berhasil mengubah status lock operator");
      queryClient.invalidateQueries({
        queryKey: ["operator-gaji-pw-all"],
      });
      queryClient.invalidateQueries({
        queryKey: ["operator-gaji-pw"],
      });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal mengubah status lock operator";
      message.error(errorMessage);
      console.error(error);
    },
  });
};

// Hook untuk lock all operator
export const useLockAllOperators = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => lockAllOperatorGajiPW({ is_locked: true }),
    onSuccess: () => {
      message.success("Berhasil lock semua operator");
      queryClient.invalidateQueries({
        queryKey: ["operator-gaji-pw-all"],
      });
      queryClient.invalidateQueries({
        queryKey: ["operator-gaji-pw"],
      });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal lock semua operator";
      message.error(errorMessage);
      console.error(error);
    },
  });
};

// Hook untuk unlock all operator
export const useUnlockAllOperators = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => lockAllOperatorGajiPW({ is_locked: false }),
    onSuccess: () => {
      message.success("Berhasil unlock semua operator");
      queryClient.invalidateQueries({
        queryKey: ["operator-gaji-pw-all"],
      });
      queryClient.invalidateQueries({
        queryKey: ["operator-gaji-pw"],
      });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal unlock semua operator";
      message.error(errorMessage);
      console.error(error);
    },
  });
};

