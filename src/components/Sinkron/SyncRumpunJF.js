import { syncRumpunJabatanJf } from "@/services/siasn-services";
import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";

const SyncRumpunJF = () => {
  const { mutate, isLoading } = useMutation(() => syncRumpunJabatanJf(), {
    onSuccess: () => {
      message.success("Rumpun jabatan jf berhasil disinkronisasi");
    },
    onError: () => {
      message.error("Rumpun jabatan jf gagal disinkronisasi");
    },
  });

  return (
    <Button type="primary" onClick={() => mutate()} loading={isLoading}>
      Sinkron Ref Rumpun Jabatan JF
    </Button>
  );
};

export default SyncRumpunJF;
