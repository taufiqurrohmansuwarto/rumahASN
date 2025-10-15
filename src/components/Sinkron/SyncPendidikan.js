import { syncPendidikan } from "@/services/siasn-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";

const SyncPendidikan = () => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => syncPendidikan(), {
    onSuccess: () => {
      message.success("Berhasil sinkronisasi data pendidikan");
      queryClient.invalidateQueries(["daftar-sinkron"]);
    },
    onError: () => {
      message.error("Gagal sinkronisasi data pendidikan");
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
      Pendidikan
    </Button>
  );
};

export default SyncPendidikan;
