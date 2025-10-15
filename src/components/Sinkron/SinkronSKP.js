import { syncSKPSIASN } from "@/services/rekon.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";

const SinkronSKP = () => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => syncSKPSIASN(), {
    onSuccess: () => {
      message.success("Berhasil sinkronisasi data SKP");
      queryClient.invalidateQueries(["daftar-sinkron"]);
    },
    onError: () => {
      message.error("Gagal sinkronisasi data SKP");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["daftar-sinkron"]);
    },
  });

  return (
    <Button
      type="primary"
      block
      size="small"
      onClick={() => mutate()}
      loading={isLoading}
      disabled={isLoading}
    >
      SKP SIASN
    </Button>
  );
};

export default SinkronSKP;
