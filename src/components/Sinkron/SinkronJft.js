import { syncSimasterJft } from "@/services/sync.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";

const SinkronJft = () => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => syncSimasterJft(), {
    onSuccess: () => {
      message.success("Berhasil sinkronisasi data JFT");
      queryClient.invalidateQueries(["daftar-sinkron"]);
    },
    onError: () => {
      message.error("Gagal sinkronisasi data JFT");
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
      JFT
    </Button>
  );
};

export default SinkronJft;
