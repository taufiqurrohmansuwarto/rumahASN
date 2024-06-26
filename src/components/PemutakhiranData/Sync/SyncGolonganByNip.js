import { refreshGolonganByNip } from "@/services/siasn-services";
import { SyncOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Tooltip, message } from "antd";

function SyncGolonganByNip({ nip }) {
  const {
    mutate: refresh,
    isLoading,
    isError,
  } = useMutation(() => refreshGolonganByNip(nip), {
    onSuccess: (data) => {
      message.success(data?.message);
    },
    onError: () => {
      message.error("Gagal memperbarui data jabatan");
    },
  });

  return (
    <Tooltip title="Refresh Golongan jika tidak sesuai">
      <Button
        icon={<SyncOutlined />}
        onClick={refresh}
        loading={isLoading || isError}
        type="primary"
        size="small"
      >
        Golongan
      </Button>
    </Tooltip>
  );
}

export default SyncGolonganByNip;
