import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";
import { syncSKPSIASN } from "@/services/rekon.services";

const SinkronSKP = () => {
  const { mutate: syncSKP, isLoading: isSyncingSKP } = useMutation({
    mutationFn: syncSKPSIASN,
    onSuccess: () => {
      message.success("SKP berhasil disinkronisasi");
    },
    onError: () => {
      message.error("SKP gagal disinkronisasi");
    },
  });

  return (
    <div>
      <Button onClick={() => syncSKP()} loading={isSyncingSKP}>
        Sinkron SKP Siasn
      </Button>
    </div>
  );
};

export default SinkronSKP;
