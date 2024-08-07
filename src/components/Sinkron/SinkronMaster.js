import { syncPegawaiMaster } from "@/services/sync.services";
import { SyncOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";

const SinkronMaster = () => {
  const queryCLient = useQueryClient();
  const { mutate, isLoading } = useMutation(() => syncPegawaiMaster(), {
    onSuccess: () => {
      message.success("berhasil");
      queryCLient.invalidateQueries(["daftar-sinkron"]);
    },
    onError: () => {
      message.error("gagal");
    },
    onSettled: () => {
      queryCLient.invalidateQueries(["daftar-sinkron"]);
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
      Sync Pegawai
    </Button>
  );
};

export default SinkronMaster;
