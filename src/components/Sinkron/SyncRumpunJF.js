import { syncRumpunJabatanJf } from "@/services/siasn-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";

const SyncRumpunJF = () => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => syncRumpunJabatanJf(), {
    onSuccess: () => {
      message.success("Berhasil sinkronisasi data rumpun jabatan JF");
      queryClient.invalidateQueries(["daftar-sinkron"]);
    },
    onError: () => {
      message.error("Gagal sinkronisasi data rumpun jabatan JF");
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
      Rumpun Jabatan JF
    </Button>
  );
};

export default SyncRumpunJF;
