import {
  checkDocumentByNip,
  downloadDocumentByNip,
} from "@/services/master.services";
import {
  Alert,
  Badge,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconDownload,
  IconFileText,
  IconCalendar,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconLoader,
  IconFileExport,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, message } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

// Data TMT dengan keterangan yang lebih jelas
const list_tmt = [
  { value: "01032019", label: "1 Maret 2019" },
  { value: "01022022", label: "1 Februari 2022" },
  { value: "01042024", label: "1 April 2024" },
  { value: "01052024", label: "1 Mei 2024" },
  { value: "01062024", label: "1 Juni 2024" },
  { value: "01072024", label: "1 Juli 2024" },
  { value: "01082024", label: "1 Agustus 2024" },
  { value: "01012025", label: "1 Januari 2025" },
  { value: "01062025", label: "1 Juni 2025" },
  { value: "01072025", label: "1 Juli 2025" },
  { value: "01032025", label: "1 Maret 2025" },
  { value: "01082025", label: "1 Agustus 2025" },
  { value: "01102025", label: "1 Oktober 2025" },
];

// Data dokumen dengan keterangan yang lebih jelas
const dokumen = [
  { code: "SK", name: "Surat Keputusan", icon: <IconFileText size={16} /> },
  {
    code: "PERTEK",
    name: "Pertimbangan Teknis",
    icon: <IconFileText size={16} />,
  },
  {
    code: "SPMT",
    name: "Surat Pernyataan Melaksanakan Tugas",
    icon: <IconFileText size={16} />,
  },
  {
    code: "PK",
    name: "Perjanjian Kinerja (PPPK)",
    icon: <IconFileText size={16} />,
  },
];

const DocumentButton = ({ tmt, file, nip, fileName, icon }) => {
  const { data, isLoading, error } = useQuery(
    ["check-document", `${tmt}-${file.code}`],
    () => checkDocumentByNip({ tmt: tmt, file: file.code, nip }),
    {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  const [downloading, setDownloading] = useState(false);

  const downloadFile = async () => {
    try {
      setDownloading(true);
      message.loading({
        content: `Mengunduh ${file.name}...`,
        key: "download",
      });

      const result = await downloadDocumentByNip({
        tmt: tmt,
        file: file.code,
        nip,
      });

      if (result) {
        const url = `data:application/pdf;base64,${result}`;
        const link = document.createElement("a");
        link.href = url;
        link.download = `${file.code}_${tmt}.pdf`;
        link.click();
        message.success({
          content: `${file.name} berhasil diunduh`,
          key: "download",
        });
      } else {
        message.error({
          content: `Gagal mengunduh ${file.name}`,
          key: "download",
        });
      }
    } catch (error) {
      message.error({
        content: `Gagal mengunduh ${file.name}. Silakan coba lagi.`,
        key: "download",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Status dokumen
  const getBadgeProps = () => {
    if (isLoading)
      return {
        color: "gray",
        variant: "light",
        icon: <IconLoader size={12} />,
        text: "Memeriksa...",
      };
    if (error)
      return {
        color: "red",
        variant: "outline",
        icon: <IconAlertTriangle size={12} />,
        text: "Error",
      };
    if (data)
      return {
        color: "green",
        variant: "filled",
        icon: <IconCheck size={12} />,
        text: "Tersedia",
      };
    return {
      color: "red",
      variant: "light",
      icon: <IconX size={12} />,
      text: "Tidak Tersedia",
    };
  };

  const badgeProps = getBadgeProps();

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder
      style={{
        borderColor: data ? "#40c057" : "#e9ecef",
        backgroundColor: data ? "#f8fffe" : "#fff",
        cursor: data ? "pointer" : "default",
        transition: "all 0.2s ease",
      }}
    >
      <Stack spacing="xs">
        <Group spacing="xs" align="center">
          {icon}
          <Text size="sm" fw={500} style={{ flex: 1 }}>
            {file.name}
          </Text>
        </Group>

        <Group justify="space-between" align="center">
          <Badge
            color={badgeProps.color}
            variant={badgeProps.variant}
            leftSection={badgeProps.icon}
            size="sm"
          >
            {badgeProps.text}
          </Badge>

          <Tooltip
            label={data ? `Unduh ${file.name}` : "Dokumen tidak tersedia"}
          >
            <Button
              size="small"
              type={data ? "primary" : "default"}
              icon={
                downloading ? (
                  <IconLoader size={14} />
                ) : (
                  <IconDownload size={14} />
                )
              }
              onClick={downloadFile}
              disabled={!data || downloading}
              loading={downloading}
            >
              Unduh
            </Button>
          </Tooltip>
        </Group>
      </Stack>
    </Paper>
  );
};

const TMTSection = ({ tmtData, nip }) => {
  return (
    <Paper p="sm" radius="md" withBorder>
      <Group spacing="xs" mb="sm" wrap="nowrap">
        <Group spacing="xs" style={{ minWidth: "200px", flexShrink: 0 }}>
          <IconCalendar size={16} color="gray" />
          <Text size="sm" fw={500}>
            TMT {tmtData.label}
          </Text>
        </Group>

        <Group spacing="xs" style={{ flex: 1 }} wrap="wrap">
          {dokumen.map((dok) => (
            <DocumentButton
              key={`${tmtData.value}-${dok.code}`}
              tmt={tmtData.value}
              file={dok}
              nip={nip}
              fileName={dok.name}
              icon={dok.icon}
            />
          ))}
        </Group>
      </Group>
    </Paper>
  );
};

const downloadPk = async () => {
  try {
    message.loading({ content: "Membuka dokumen PK...", key: "pk" });
    const link = "https://siasn.bkd.jatimprov.go.id:9000/public/PK_2_7.pdf";
    window.open(link, "_blank");
    message.success({ content: "Dokumen PK berhasil dibuka", key: "pk" });
  } catch (error) {
    message.error({ content: "Gagal membuka dokumen PK", key: "pk" });
  }
};

const downloadPerpanjangan = async () => {
  try {
    message.loading({ content: "Membuka dokumen PK...", key: "pk" });
    const link =
      "https://siasn.bkd.jatimprov.go.id:9000/public/perpanjangan_p3k.pdf";
    window.open(link, "_blank");
    message.success({ content: "Dokumen PK berhasil dibuka", key: "pk" });
  } catch (error) {
    message.error({ content: "Gagal membuka dokumen PK", key: "pk" });
  }
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
        icon={<IconAlertTriangle size={16} />}
      >
        Silakan periksa kembali URL atau kembali ke halaman sebelumnya.
      </Alert>
    );
  }

  return (
    <Stack spacing="lg">
      {/* Header */}
      <Paper p="md" radius="md" withBorder>
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={2} mb="xs">
              Dokumen Administrasi ASN
            </Title>
            <Text size="sm" c="dimmed">
              NIP: {nip}
            </Text>
          </Box>
          <Group spacing="xs">
            <Tooltip label="Unduh dokumen perpanjangan PPPK">
              <Button
                type="default"
                icon={<IconFileExport size={16} />}
                onClick={downloadPerpanjangan}
                size="small"
              >
                Perpanjangan
              </Button>
            </Tooltip>
            <Tooltip label="Unduh template PK halaman 2-7">
              <Button
                type="default"
                icon={<IconFileExport size={16} />}
                onClick={downloadPk}
                size="small"
              >
                Template PK
              </Button>
            </Tooltip>
          </Group>
        </Group>
      </Paper>

      {/* Info Panel */}
      <Alert
        title="Informasi"
        variant="light"
        icon={<IconAlertTriangle size={16} />}
      >
        Klik tombol 'Unduh' untuk mengunduh dokumen. Pastikan koneksi internet
        stabil untuk proses download yang optimal.
      </Alert>

      {/* Dokumen Sections */}
      <Stack spacing="md">
        {list_tmt.map((tmtData) => (
          <TMTSection key={tmtData.value} tmtData={tmtData} nip={nip} />
        ))}
      </Stack>
    </Stack>
  );
}

export default AdministrasiByNip;
