import { pingKoneksi } from "@/services/bankjatim.services";
import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";

const PingBankJatim = () => {
  const { mutate: ping, isLoading } = useMutation(() => pingKoneksi(), {
    onSuccess: (data) => {
      message.success("Ping berhasil");
    },
    onError: (error) => {
      message.error(error?.response?.data?.message);
    },
  });

  const handlePing = () => {
    ping();
  };

  return (
    <Button onClick={handlePing} loading={isLoading}>
      Ping
    </Button>
  );
};

export default PingBankJatim;
