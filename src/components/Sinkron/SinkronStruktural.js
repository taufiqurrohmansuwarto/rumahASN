import { useMutation } from "@tanstack/react-query";
import { syncRekonStruktural } from "@/services/rekon.services";
import { Button } from "antd";

const SinkronStruktural = () => {
  const { mutate, isLoading } = useMutation(() => syncRekonStruktural());

  const handleSync = () => {
    mutate();
  };

  return (
    <Button type="primary" onClick={handleSync} loading={isLoading}>
      Sinkronisasi Struktural
    </Button>
  );
};

export default SinkronStruktural;
