import { syncSimasterJft } from "@/services/sync.services";
import { SyncOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";

const SinkronJft = () => {
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => syncSimasterJft(), {
    onSuccess: () => {
      message.success("Berhasil Sinkron JFT");
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
      Sync JFT
    </Button>
  );
};

export default SinkronJft;
