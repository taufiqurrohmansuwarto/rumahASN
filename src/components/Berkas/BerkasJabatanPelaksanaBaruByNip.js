import {
  checkDocumentByNip,
  downloadDocumentByNip,
} from "@/services/master.services";
import { Alert, Box, Group, Paper, Stack, Text, Tooltip } from "@mantine/core";
import {
  IconAlertTriangle,
  IconDownload,
  IconFileText,
  IconLoader,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, message } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const TombolDokumen = ({ tmt, file, nip }) => {
  const { data } = useQuery(
    ["check-document-pelaksana", `${tmt}-${file}-${nip}`],
    () => checkDocumentByNip({ tmt, file, nip }),
    { refetchOnWindowFocus: false, retry: 1 }
  );

  const [downloading, setDownloading] = useState(false);

  const downloadFile = async () => {
    try {
      setDownloading(true);
      message.loading({ content: `Mengunduh ${file}...`, key: "download" });
      const result = await downloadDocumentByNip({ tmt, file, nip });
      if (result) {
        const url = `data:application/pdf;base64,${result}`;
        const link = document.createElement("a");
        link.href = url;
        link.download = `${file}_${tmt}.pdf`;
        link.click();
        message.success({ content: `${file} berhasil diunduh`, key: "download" });
      } else {
        message.error({ content: `${file} tidak tersedia`, key: "download" });
      }
    } catch (error) {
      message.error({ content: `Gagal mengunduh ${file}`, key: "download" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Tooltip label={data ? `Unduh ${file}` : "Tidak tersedia"} withArrow>
      <Button
        size="small"
        type={data ? "primary" : "default"}
        icon={downloading ? <IconLoader size={12} /> : <IconDownload size={12} />}
        onClick={downloadFile}
        disabled={!data || downloading}
        loading={downloading}
        style={{ fontSize: 12, padding: "0 8px", height: 24 }}
      >
        {file}
      </Button>
    </Tooltip>
  );
};

function BerkasJabatanPelaksanaBaruByNip() {
  const router = useRouter();
  const { nip } = router.query;

  if (!nip) {
    return (
      <Alert
        title="NIP tidak ditemukan"
        color="yellow"
        variant="light"
        icon={<IconAlertTriangle size={14} />}
        p="xs"
      >
        Silakan periksa kembali URL.
      </Alert>
    );
  }

  return (
    <Stack spacing="xs">
      <Paper p="xs" radius="sm" withBorder>
        <Group justify="space-between" align="center">
          <Box>
            <Text fw={600} size="sm">SK Jabatan Pelaksana 2025</Text>
            <Text size="xs" c="dimmed">NIP: {nip}</Text>
          </Box>
          <Group spacing={4} align="center">
            <IconFileText size={14} color="#868e96" />
            <TombolDokumen tmt="PELAKSANA25" file="SK" nip={nip} />
          </Group>
        </Group>
      </Paper>
    </Stack>
  );
}

export default BerkasJabatanPelaksanaBaruByNip;
