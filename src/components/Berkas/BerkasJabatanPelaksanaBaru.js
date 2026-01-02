import { checkDocument, downloadDocument } from "@/services/berkas.services";
import { Box, Group, Paper, Stack, Text, Tooltip } from "@mantine/core";
import { IconDownload, IconFileText, IconLoader } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, message } from "antd";
import { useState } from "react";

const TombolDokumen = ({ tmt, file }) => {
  const { data } = useQuery(
    ["check-document-pelaksana", `${tmt}-${file}`],
    () => checkDocument({ tmt, file }),
    { refetchOnWindowFocus: false, retry: 1 }
  );

  const [downloading, setDownloading] = useState(false);

  const downloadFile = async () => {
    try {
      setDownloading(true);
      message.loading({ content: `Mengunduh ${file}...`, key: "download" });
      const result = await downloadDocument({ tmt, file });
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

function BerkasJabatanPelaksanaBaru() {
  return (
    <Stack spacing="xs">
      <Paper p="xs" radius="sm" withBorder>
        <Group justify="space-between" align="center">
          <Box>
            <Text fw={600} size="sm">SK Jabatan Pelaksana 2025</Text>
            <Text size="xs" c="dimmed">Unduh SK pengangkatan jabatan pelaksana</Text>
          </Box>
          <Group spacing={4} align="center">
            <IconFileText size={14} color="#868e96" />
            <TombolDokumen tmt="PELAKSANA25" file="SK" />
          </Group>
        </Group>
      </Paper>
    </Stack>
  );
}

export default BerkasJabatanPelaksanaBaru;
