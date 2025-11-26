import { getDataUtamaParuhWaktuByNip } from "@/services/siasn-services";
import {
  Text,
  Stack,
  Group,
  Paper,
  Badge,
  Switch as MantineSwitch,
  Divider,
} from "@mantine/core";
import {
  IconUser,
  IconId,
  IconBuilding,
  IconBriefcase,
  IconSchool,
  IconMail,
  IconPhone,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { Modal, Spin } from "antd";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const ModalDetailSiasnParuhWaktu = ({ visible, onClose, nip }) => {
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["data-utama-paruh-waktu", nip],
    queryFn: () => getDataUtamaParuhWaktuByNip(nip),
    enabled: !!nip && visible,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const censorText = (text, type = "default") => {
    if (!text || showSensitiveData) return text || "-";

    if (type === "email") {
      const [localPart, domain] = text.split("@");
      if (!domain) return "***@***.***";
      return `${localPart.slice(0, 2)}***@${domain}`;
    }

    if (type === "phone") {
      if (text.length <= 4) return "****";
      return `${text.slice(0, 4)}****${text.slice(-2)}`;
    }

    return "****";
  };

  return (
    <Modal
      title="Detail Data SIASN"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="small" />
          <Text size="xs" c="dimmed" mt={8}>
            Memuat data...
          </Text>
        </div>
      ) : data ? (
        <Stack spacing="sm">
          {/* Toggle Sensor */}
          <Paper p="xs" radius="md" withBorder style={{ background: "#f8f9fa" }}>
            <Group position="apart">
              <Group spacing="xs">
                {showSensitiveData ? (
                  <IconEye size={14} />
                ) : (
                  <IconEyeOff size={14} />
                )}
                <Text size="xs" fw={500}>
                  Tampilkan Data Sensitif
                </Text>
              </Group>
              <MantineSwitch
                size="sm"
                checked={showSensitiveData}
                onChange={(e) => setShowSensitiveData(e.currentTarget.checked)}
                color="orange"
              />
            </Group>
          </Paper>

          {/* Info Pegawai */}
          <Paper p="sm" radius="md" withBorder>
            <Stack spacing={6}>
              <Group position="apart">
                <Group spacing={4}>
                  <IconUser size={12} style={{ color: "#868e96" }} />
                  <Text size="xs" c="dimmed">
                    Nama
                  </Text>
                </Group>
                <Text size="xs" fw={600}>
                  {data?.nama || "-"}
                </Text>
              </Group>

              <Group position="apart">
                <Group spacing={4}>
                  <IconId size={12} style={{ color: "#868e96" }} />
                  <Text size="xs" c="dimmed">
                    NIP
                  </Text>
                </Group>
                <Text size="xs" fw={500} ff="monospace">
                  {data?.nipBaru || "-"}
                </Text>
              </Group>

              <Divider size="xs" my={4} />

              <Group position="apart">
                <Text size="xs" c="dimmed">
                  Kedudukan
                </Text>
                <Badge size="xs" color="orange" variant="light">
                  {data?.kedudukanPnsNama || "-"}
                </Badge>
              </Group>

              <Group position="apart">
                <Group spacing={4}>
                  <IconBriefcase size={12} style={{ color: "#868e96" }} />
                  <Text size="xs" c="dimmed">
                    Jabatan
                  </Text>
                </Group>
                <Text
                  size="xs"
                  fw={500}
                  style={{ textAlign: "right", maxWidth: 200 }}
                >
                  {data?.jabatanNama || "-"}
                </Text>
              </Group>

              <Group position="apart">
                <Group spacing={4}>
                  <IconBuilding size={12} style={{ color: "#868e96" }} />
                  <Text size="xs" c="dimmed">
                    Unit Kerja
                  </Text>
                </Group>
                <Text
                  size="xs"
                  style={{ textAlign: "right", maxWidth: 200 }}
                >
                  {data?.unorNama || "-"}
                </Text>
              </Group>

              <Group position="apart">
                <Group spacing={4}>
                  <IconSchool size={12} style={{ color: "#868e96" }} />
                  <Text size="xs" c="dimmed">
                    Pendidikan
                  </Text>
                </Group>
                <Text size="xs">{data?.tkPendidikanTerakhir || "-"}</Text>
              </Group>

              <Divider size="xs" my={4} />

              <Group position="apart">
                <Text size="xs" c="dimmed">
                  TMT CPNS
                </Text>
                <Text size="xs" ff="monospace">
                  {data?.tmtCpns || "-"}
                </Text>
              </Group>

              <Group position="apart">
                <Text size="xs" c="dimmed">
                  Status NIK
                </Text>
                <Badge
                  size="xs"
                  color={data?.validNik ? "green" : "red"}
                  variant="filled"
                >
                  {data?.validNik ? "Terverifikasi" : "Belum"}
                </Badge>
              </Group>
            </Stack>
          </Paper>

          {/* Data Sensitif */}
          <Paper p="sm" radius="md" withBorder>
            <Text size="xs" fw={600} c="dimmed" mb="xs">
              Data Kontak
            </Text>
            <Stack spacing={6}>
              <Group position="apart">
                <Group spacing={4}>
                  <IconMail size={12} style={{ color: "#868e96" }} />
                  <Text size="xs" c="dimmed">
                    Email
                  </Text>
                </Group>
                <Text size="xs" ff="monospace">
                  {censorText(data?.email, "email")}
                </Text>
              </Group>

              <Group position="apart">
                <Group spacing={4}>
                  <IconPhone size={12} style={{ color: "#868e96" }} />
                  <Text size="xs" c="dimmed">
                    No HP
                  </Text>
                </Group>
                <Text size="xs" ff="monospace">
                  {censorText(data?.noHp, "phone")}
                </Text>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      ) : (
        <Paper p="md" radius="md" withBorder>
          <Text size="xs" c="dimmed" ta="center">
            Data tidak ditemukan
          </Text>
        </Paper>
      )}
    </Modal>
  );
};

export default ModalDetailSiasnParuhWaktu;

