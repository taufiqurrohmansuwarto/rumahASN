import { refreshGolonganByNip } from "@/services/siasn-services";
import { SyncOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";

function SyncGolonganByNip({ nip }) {
  const { mutate: refresh, isLoading } = useMutation(
    () => refreshGolonganByNip(nip),
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
      type="primary"
      size="small"
    >
      Golongan
    </Button>
  );
}

export default SyncGolonganByNip;
