import { syncUnorMaster } from "@/services/sync.services";
import { SyncOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";

const SinkronUnorMaster = () => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => syncUnorMaster(), {
    onSuccess: () => {
      message.success("Berhasil Sinkron Unor Master");
      queryClient.invalidateQueries(["daftar-sinkron"]);
    },
    onError: () => {
      message.error("gagal");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["daftar-sinkron"]);
    },
  });

  const handleClick = () => {
    mutate();
  };

  return (
    <Button
      type="primary"
      onClick={handleClick}
      loading={isLoading}
      disabled={isLoading}
      icon={<SyncOutlined />}
    >
      Sync Unor
    </Button>
  );
};

export default SinkronUnorMaster;
