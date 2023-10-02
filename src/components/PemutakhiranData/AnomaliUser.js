import {
  getUserAnomali2023,
  patchAnomaliUser2023,
} from "@/services/anomali.services";
import {
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Skeleton, Tag, Tooltip, message } from "antd";
import { useRouter } from "next/router";

const textAnomali = (jenis) => {
  if (jenis === "FORMASI_JF_BELUMDIANGKAT") {
    return "Anda terkena data anomali 2023 Formasi JF Belum Diangkat. Segera input data JF tebaru Anda di menu Jabatan";
  } else if (jenis === "UNOR_NONAKTIF") {
    return "Anda terkena data anomali 2023 Unor Non Aktif. Segera perbarui Jabatan anda menggunakan awalan UPT ...  bagian unor di Jabatan";
  }
};

function AnomaliUser() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(["anomali-user"], () =>
    getUserAnomali2023()
  );

  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => patchAnomaliUser2023(data),
    {
      onSuccess: () => {
        message.success("Berhasil memperbarui data");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["anomali-user"]);
      },
    }
  );

  const handleUpdate = async (id) => {
    Modal.confirm({
      title: "Konfirmasi",
      content:
        "Apakah Anda yakin sudah memperbaiki data ini?. Pastikan kembali data yang Anda input sudah benar",
      centered: true,
      onOk: async () => {
        await update({ id, data: { is_repaired: true } });
      },
    });
  };

  const gotoPertanyaan = () => {
    router.push("/tickets/create");
  };

  return (
    <Skeleton loading={isLoading}>
      {data?.length > 0 && (
        <>
          {data?.map((item) => {
            return (
              <Tooltip
                title={textAnomali(item?.jenis_anomali_nama)}
                key={item?.id}
              >
                <Tag
                  style={{ cursor: "pointer" }}
                  color={item?.is_repaired ? "green" : "red"}
                  icon={<ExclamationCircleOutlined />}
                  onClick={async () => await handleUpdate(item?.id)}
                >
                  {item?.jenis_anomali_nama}
                </Tag>
              </Tooltip>
            );
          })}
          <Tooltip title="Tanya BKD">
            <Button
              onClick={gotoPertanyaan}
              type="link"
              shape="circle"
              icon={<QuestionCircleOutlined />}
            />
          </Tooltip>
        </>
      )}
    </Skeleton>
  );
}

export default AnomaliUser;
