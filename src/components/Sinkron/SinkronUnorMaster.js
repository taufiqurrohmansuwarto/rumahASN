import { syncUnorMaster } from "@/services/sync.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";

const SinkronUnorMaster = () => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => syncUnorMaster(), {
    onSuccess: () => {
      message.success("Berhasil sinkronisasi data unor");
      queryClient.invalidateQueries(["daftar-sinkron"]);
    },
    onError: () => {
      message.error("Gagal sinkronisasi data unor");
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
      Unor
    </Button>
  );
};

export default SinkronUnorMaster;
