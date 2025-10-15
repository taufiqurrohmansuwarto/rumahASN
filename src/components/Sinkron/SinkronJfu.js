import { syncSimasterJfu } from "@/services/sync.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";

const SinkronJfu = () => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => syncSimasterJfu(), {
    onSuccess: () => {
      message.success("Berhasil sinkronisasi data JFU");
      queryClient.invalidateQueries(["daftar-sinkron"]);
    },
    onError: () => {
      message.error("Gagal sinkronisasi data JFU");
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
      JFU
    </Button>
  );
};

export default SinkronJfu;
