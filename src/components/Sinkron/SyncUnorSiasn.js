import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";
import { resetUnor } from "@/services/siasn-services";

const SyncUnorSiasn = () => {
  const { mutate: syncUnor, isLoading: isSyncingUnor } = useMutation({
    mutationFn: resetUnor,
    onSuccess: () => {
      message.success("Unor berhasil disinkronisasi");
    },
    onError: () => {
      message.error("Unor gagal disinkronisasi");
    },
  });

  return (
    <div>
      <Button onClick={() => syncUnor()} loading={isSyncingUnor}>
        Sikro Unor Siasn
      </Button>
    </div>
  );
};

export default SyncUnorSiasn;
