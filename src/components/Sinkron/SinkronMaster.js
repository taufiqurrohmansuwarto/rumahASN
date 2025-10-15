import { syncPegawaiMaster } from "@/services/sync.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";

const SinkronMaster = () => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => syncPegawaiMaster(), {
    onSuccess: () => {
      message.success("Berhasil sinkronisasi data pegawai");
      queryClient.invalidateQueries(["daftar-sinkron"]);
    },
    onError: () => {
      message.error("Gagal sinkronisasi data pegawai");
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
      Pegawai
    </Button>
  );
};

export default SinkronMaster;
