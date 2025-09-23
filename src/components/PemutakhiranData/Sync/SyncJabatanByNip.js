import { refreshJabatanByNip } from "@/services/siasn-services";
import { SyncOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Tooltip, message } from "antd";

function SyncJabatanByNip({ nip }) {
  const {
    mutate: refresh,
    isLoading,
    isError,
  } = useMutation(() => refreshJabatanByNip(nip), {
    onSuccess: (data) => {
      message.success(data?.message);
    },
    onError: () => {
      message.error("Gagal memperbarui data jabatan");
    },
  });

  return (
    <Tooltip title="Refresh Jabatan jika jabatan tidak sesuai">
      <Button
        icon={<SyncOutlined />}
        onClick={refresh}
        loading={isLoading || isError}
        size="small"
        type="default"
        style={{ fontSize: '11px', height: '24px', padding: '0 8px' }}
      >
        Sync Jabatan
      </Button>
    </Tooltip>
  );
}

export default SyncJabatanByNip;
