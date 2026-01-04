import {
  checkDocumentByNip,
  downloadDocumentByNip,
} from "@/services/master.services";
import { DOKUMEN_ADMINISTRASI, LIST_TMT } from "@/utils/client-utils";
import { Alert, Box, Group, Paper, Stack, Text, Tooltip } from "@mantine/core";
import {
  IconAlertTriangle,
  IconCalendar,
  IconDownload,
  IconFileExport,
  IconLoader,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, message } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const TombolDokumen = ({ tmt, file, nip }) => {
  const { data } = useQuery(
    ["check-document", `${tmt}-${file.code}-${nip}`],
    () => checkDocumentByNip({ tmt, file: file.code, nip }),
    { refetchOnWindowFocus: false, retry: 1 }
  );

  const [downloading, setDownloading] = useState(false);

  const downloadFile = async () => {
    try {
      setDownloading(true);
      message.loading({ content: `Mengunduh ${file.name}...`, key: "download" });
      const result = await downloadDocumentByNip({ tmt, file: file.code, nip });
      if (result) {
        const url = `data:application/pdf;base64,${result}`;
        const link = document.createElement("a");
        link.href = url;
        link.download = `${file.code}_${tmt}.pdf`;
        link.click();
        message.success({ content: `${file.name} berhasil diunduh`, key: "download" });
      } else {
        message.error({ content: `${file.name} tidak tersedia`, key: "download" });
      }
    } catch (error) {
      message.error({ content: `Gagal mengunduh ${file.name}`, key: "download" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Tooltip label={data ? `Unduh ${file.fullName}` : "Tidak tersedia"} withArrow>
      <Button
        size="small"
        type={data ? "primary" : "default"}
        icon={downloading ? <IconLoader size={12} /> : <IconDownload size={12} />}
        onClick={downloadFile}
        disabled={!data || downloading}
        loading={downloading}
        style={{ fontSize: 12, padding: "0 8px", height: 24 }}
      >
        {file.name}
      </Button>
    </Tooltip>
  );
};

const DokumenPerTMT = ({ tmtData, nip }) => (
  <Group spacing={8} align="center" noWrap>
    <Group spacing={4} style={{ minWidth: 100 }} noWrap>
      <IconCalendar size={14} color="#868e96" />
      <Text size="xs" fw={500}>{tmtData.label}</Text>
    </Group>
    <Group spacing={4}>
      {DOKUMEN_ADMINISTRASI.map((dok) => (
        <TombolDokumen key={`${tmtData.value}-${dok.code}`} tmt={tmtData.value} file={dok} nip={nip} />
      ))}
    </Group>
  </Group>
);

// Fungsi download template
const downloadPk = () => {
  window.open("https://siasn.bkd.jatimprov.go.id:9000/public/PK_2_7.pdf", "_blank");
};

const downloadPkParuhWaktu = () => {
  window.open("https://siasn.bkd.jatimprov.go.id:9000/public/PK_PW_2_14.pdf", "_blank");
};

const downloadPerpanjangan = () => {
  window.open("https://siasn.bkd.jatimprov.go.id:9000/public/perpanjangan_p3k.pdf", "_blank");
};

function AdministrasiByNip() {
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
      {/* Header */}
      <Paper p="xs" radius="sm" withBorder>
        <Group justify="space-between" align="center">
          <Box>
            <Text fw={600} size="sm">Dokumen Administrasi PNS/PPPK</Text>
            <Text size="xs" c="dimmed">NIP: {nip}</Text>
          </Box>
          <Group spacing={4}>
            <Tooltip label="Perpanjangan Kontrak PPPK" withArrow>
              <Button
                type="default"
                icon={<IconFileExport size={12} />}
                onClick={downloadPerpanjangan}
                style={{ fontSize: 11, padding: "0 6px", height: 22 }}
              >
                Perpanjangan
              </Button>
            </Tooltip>
            <Tooltip label="Template PK halaman 2-7" withArrow>
              <Button
                type="default"
                icon={<IconFileExport size={12} />}
                onClick={downloadPk}
                style={{ fontSize: 11, padding: "0 6px", height: 22 }}
              >
                PK
              </Button>
            </Tooltip>
            <Tooltip label="PK Paruh Waktu pasal 2-14" withArrow>
              <Button
                type="default"
                icon={<IconFileExport size={12} />}
                onClick={downloadPkParuhWaktu}
                style={{ fontSize: 11, padding: "0 6px", height: 22 }}
              >
                PK Paruh Waktu
              </Button>
            </Tooltip>
          </Group>
        </Group>
      </Paper>

      {/* Daftar Dokumen per TMT */}
      <Paper p="xs" radius="sm" withBorder>
        <Stack spacing={6}>
          {LIST_TMT.map((tmtData) => (
            <DokumenPerTMT key={tmtData.value} tmtData={tmtData} nip={nip} />
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}

export default AdministrasiByNip;
