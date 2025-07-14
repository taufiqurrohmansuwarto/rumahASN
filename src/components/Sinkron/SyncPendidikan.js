import { syncPendidikan } from "@/services/siasn-services";
import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";

const SyncPendidikan = () => {
  const { mutate, isLoading } = useMutation(() => syncPendidikan(), {
    onSuccess: () => {
      message.success("Pendidikan berhasil disinkronisasi");
    },
    onError: () => {
      message.error("Pendidikan gagal disinkronisasi");
    },
  });

  return (
    <Button type="primary" onClick={() => mutate()} loading={isLoading}>
      Sinkron Ref Pendidikan
    </Button>
  );
};

export default SyncPendidikan;
