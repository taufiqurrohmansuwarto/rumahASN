import { removeJabatan } from "@/services/siasn-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Popconfirm, message } from "antd";
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
      },
      onError: () => {
        message.error("Gagal menghapus jabatan");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["data-jabatan"]);
      },
    }
  );

  const { data } = useSession();

  return (
    <>
      {data?.user?.current_role === "admin" && (
        <Popconfirm
          title="Are you sure you want to delete this item?"
          onConfirm={async () => await hapus()}
        >
          <a>Hapus</a>
        </Popconfirm>
      )}
    </>
  );
}

export default HapusJabatan;
