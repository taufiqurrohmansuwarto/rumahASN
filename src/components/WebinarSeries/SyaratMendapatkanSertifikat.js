import { ActionIcon, Alert, Stack } from "@mantine/core";
import { IconCircleCheck, IconCircleX, IconSquareCheck } from "@tabler/icons";
import { Space } from "antd";

function SyaratMendapatkanSertifikat({ data }) {
  return (
    <Alert
      icon={<IconSquareCheck />}
      title="Syarat Mendapatkan Sertifikat"
      color="yellow"
    >
      <Stack spacing="xs">
        <Space>
          <ActionIcon
            color={data?.sudah_mengisi_informasi_user ? "green" : "red"}
            variant="transparent"
          >
            {data?.sudah_mengisi_informasi_user ? (
              <IconCircleCheck size={20} />
            ) : (
              <IconCircleX size={20} />
            )}
          </ActionIcon>
          Mengisi Informasi Sertifikat
        </Space>
        <Space>
          <ActionIcon
            color={data?.sudah_absen ? "green" : "red"}
            variant="transparent"
          >
            {data?.sudah_absen ? (
              <IconCircleCheck size={20} />
            ) : (
              <IconCircleX size={20} />
            )}
          </ActionIcon>
          Mengisi Daftar Hadir / Presensi (Jika Ada)
        </Space>

        <Space>
          <ActionIcon
            color={data?.sudah_poll ? "green" : "red"}
            variant="transparent"
          >
            {data?.sudah_poll ? (
              <IconCircleCheck size={20} />
            ) : (
              <IconCircleX size={20} />
            )}
          </ActionIcon>
          Mengisi Kuisioner (Dilakukan setelah acara selesai)
        </Space>
      </Stack>
    </Alert>
  );
}

export default SyaratMendapatkanSertifikat;
