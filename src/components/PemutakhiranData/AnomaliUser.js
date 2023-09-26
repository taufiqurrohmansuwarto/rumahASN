import { getUserAnomali2023 } from "@/services/anomali.services";
import {
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Skeleton, Tag, Tooltip } from "antd";
import { useRouter } from "next/router";

const textAnomali = (jenis) => {
  if (jenis === "FORMASI_JF_BELUMDIANGKAT") {
    return "Anda terkena data anomali 2023 Formasi JF Belum Diangkat. Segera input data JF Anda di menu Jabatan";
  } else if (jenis === "UNOR_NONAKTIF") {
    return "Anda terkena data anomali 2023 Unor Non Aktif. Segera perbarui Jabatan Anda di menu Jabatan";
  }
};

function AnomaliUser() {
  const router = useRouter();

  const { data, isLoading } = useQuery(["anomali-user"], () =>
    getUserAnomali2023()
  );

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
                  style={{
                    cursor: "pointer",
                  }}
                  color="red"
                  icon={<ExclamationCircleOutlined />}
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
