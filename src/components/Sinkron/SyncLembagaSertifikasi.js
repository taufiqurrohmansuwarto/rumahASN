import { syncLembagaSertifikasi } from "@/services/siasn-services";
import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";

const SyncLembagaSertifikasi = () => {
  const { mutate, isLoading } = useMutation(() => syncLembagaSertifikasi(), {
    onSuccess: () => {
      message.success("Lembaga sertifikasi berhasil disinkronisasi");
    },
    onError: () => {
      message.error("Lembaga sertifikasi gagal disinkronisasi");
    },
  });

  return (
    <Button type="primary" onClick={() => mutate()} loading={isLoading}>
      Sinkron Ref Lembaga Sertifikasi
    </Button>
  );
};

export default SyncLembagaSertifikasi;
