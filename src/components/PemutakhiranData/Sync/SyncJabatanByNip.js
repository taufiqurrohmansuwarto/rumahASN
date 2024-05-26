import { refreshJabatanByNip } from "@/services/siasn-services";
import { SyncOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";

function SyncJabatanByNip({ nip }) {
  const { mutate: refresh, isLoading } = useMutation(
    () => refreshJabatanByNip(nip),
    {
      onSuccess: (data) => {
        message.success(data?.message);
      },
      onError: () => {
        message.error("Gagal memperbarui data jabatan");
      },
    }
  );

  return (
    <Button
      icon={<SyncOutlined />}
      onClick={refresh}
      loading={isLoading}
      disabled
      size="small"
      type="primary"
    >
      Jabatan
    </Button>
  );
}

export default SyncJabatanByNip;
