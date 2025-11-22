import { removeJabatan } from "@/services/siasn-services";
import { IconTrash } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Popconfirm, Tooltip, message } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/dist/client/router";

function HapusJabatan({ id }) {
  const router = useRouter();
  const { nip } = router.query;

  const queryClient = useQueryClient();
  const { mutateAsync: hapus, isLoading } = useMutation(
    () => removeJabatan({ nip, id }),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus jabatan");
        queryClient.invalidateQueries(["data-jabatan"]);
      },
      onError: (error) => {
        const msg = error?.response?.data?.message || "Gagal menghapus jabatan";
        message.error(msg);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["data-jabatan"]);
      },
    }
  );

  return (
    <Popconfirm
      title="Are you sure you want to delete this item?"
      onConfirm={async () => await hapus()}
    >
      <Tooltip title="Hapus">
        <Button
          size="small"
          danger
          icon={<IconTrash size={14} />}
          loading={isLoading}
        />
      </Tooltip>
    </Popconfirm>
  );
}

export default HapusJabatan;
