import { syncPengadaanParuhWaktu } from "@/services/siasn-services";
import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";

export const useSyncPengadaanParuhWaktu = () => {
  return useMutation(() => syncPengadaanParuhWaktu(), {
    onSuccess: () => {
      message.success("Berhasil rekon data pengadaan paruh waktu");
    },
    onError: () => {
      message.error("Gagal rekon data pengadaan paruh waktu");
    },
  });
};

export const SyncPengadaanParuhWaktu = () => {
  const { mutate: sync, isLoading: isSyncing } = useSyncPengadaanParuhWaktu();

  return (
    <Button
      loading={isSyncing}
      type="primary"
      onClick={() => sync()}
      disabled={isSyncing}
    >
      Rekon Pengadaan Paruh Waktu
    </Button>
  );
};
