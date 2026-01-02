import {
  checkDocumentPerbaikan,
  downloadDocumentPerbaikan,
} from "@/services/berkas.services";
import { Box, Group, Paper, Stack, Text, Tooltip } from "@mantine/core";
import { IconDownload, IconFileText, IconLoader } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, message } from "antd";
import { useState } from "react";

const TombolDokumen = ({ tmt, file }) => {
  const { data } = useQuery(
    ["check-document-perbaikan", `${tmt}-${file}`],
    () => checkDocumentPerbaikan({ formasi: tmt, file }),
    { refetchOnWindowFocus: false, retry: 1 }
  );

  const [downloading, setDownloading] = useState(false);

  const downloadFile = async () => {
    try {
      setDownloading(true);
      message.loading({ content: `Mengunduh ${file}...`, key: "download" });
      const result = await downloadDocumentPerbaikan({ formasi: tmt, file });
      if (result) {
        const url = `data:application/pdf;base64,${result}`;
        const link = document.createElement("a");
        link.href = url;
        link.download = `PERBAIKAN_${file}_${tmt}.pdf`;
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

function AdministrasiPerbaikan() {
  return (
    <Stack spacing="xs">
      <Paper p="xs" radius="sm" withBorder>
        <Group justify="space-between" align="center">
          <Box>
            <Text fw={600} size="sm">Perbaikan Dokumen PPPK Gol VII</Text>
            <Text size="xs" c="dimmed">Formasi 2021</Text>
          </Box>
          <Group spacing={4} align="center">
            <IconFileText size={14} color="#868e96" />
            <TombolDokumen tmt="2021" file="PK" />
          </Group>
        </Group>
      </Paper>
    </Stack>
  );
}

export default AdministrasiPerbaikan;
