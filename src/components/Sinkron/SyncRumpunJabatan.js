import { syncRumpunJabatan } from "@/services/siasn-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";

const SyncRumpunJabatan = () => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => syncRumpunJabatan(), {
    onSuccess: () => {
      message.success("Berhasil sinkronisasi data rumpun jabatan");
      queryClient.invalidateQueries(["daftar-sinkron"]);
    },
    onError: () => {
      message.error("Gagal sinkronisasi data rumpun jabatan");
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
      Rumpun Jabatan
    </Button>
  );
};

export default SyncRumpunJabatan;
