import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  addOperatorGajiPW,
  deleteOperatorGajiPW,
} from "@/services/siasn-services";

// Hook untuk menambahkan operator
export const useAddOperator = (unorId, refetchOperator, refetchFasilitator) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => addOperatorGajiPW(data),
    onSuccess: () => {
      message.success("Berhasil menambahkan operator");
      queryClient.invalidateQueries({ queryKey: ["operator-gaji-pw", unorId] });
      queryClient.invalidateQueries({
        queryKey: ["operator-gaji-pw-all"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unor-fasilitator-fasilitator", unorId],
      });
      refetchOperator();
      refetchFasilitator();
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal menambahkan operator";
      message.error(errorMessage);
      console.error(error);
      refetchOperator();
    },
  });
};

// Hook untuk menghapus operator
export const useDeleteOperator = (
  unorId,
  refetchOperator,
  refetchFasilitator
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => deleteOperatorGajiPW({ id }),
    onSuccess: () => {
      message.success("Berhasil menghapus operator");
      queryClient.invalidateQueries({
        queryKey: ["operator-gaji-pw", unorId],
      });
      queryClient.invalidateQueries({
        queryKey: ["operator-gaji-pw-all"],
      });
      queryClient.invalidateQueries({
        queryKey: ["unor-fasilitator-fasilitator", unorId],
      });
      refetchOperator();
      refetchFasilitator();
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal menghapus operator";
      message.error(errorMessage);
      console.error(error);
      refetchOperator();
    },
  });
};

