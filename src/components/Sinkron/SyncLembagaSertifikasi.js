import { syncLembagaSertifikasi } from "@/services/siasn-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";

const SyncLembagaSertifikasi = () => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => syncLembagaSertifikasi(), {
    onSuccess: () => {
      message.success("Berhasil sinkronisasi data lembaga sertifikasi");
      queryClient.invalidateQueries(["daftar-sinkron"]);
    },
    onError: () => {
      message.error("Gagal sinkronisasi data lembaga sertifikasi");
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
      Lembaga Sertifikasi
    </Button>
  );
};

export default SyncLembagaSertifikasi;
