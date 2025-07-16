import { syncRumpunJabatan } from "@/services/siasn-services";
import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";

const SyncRumpunJabatan = () => {
  const { mutate, isLoading } = useMutation(() => syncRumpunJabatan(), {
    onSuccess: () => {
      message.success("Rumpun jabatan berhasil disinkronisasi");
    },
    onError: () => {
      message.error("Rumpun jabatan gagal disinkronisasi");
    },
  });

  return (
    <Button type="primary" onClick={() => mutate()} loading={isLoading}>
      Sinkron Ref Rumpun Jabatan
    </Button>
  );
};

export default SyncRumpunJabatan;
