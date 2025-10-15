import { resetUnor } from "@/services/siasn-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";

const SyncUnorSiasn = () => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => resetUnor(), {
    onSuccess: () => {
      message.success("Berhasil sinkronisasi data unor SIASN");
      queryClient.invalidateQueries(["daftar-sinkron"]);
    },
    onError: () => {
      message.error("Gagal sinkronisasi data unor SIASN");
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
      Unor SIASN
    </Button>
  );
};

export default SyncUnorSiasn;
