import { Badge, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconCalendar,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { Button, InputNumber, message, Modal, Skeleton, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminJadwalAdvokasi,
  updateAdminJadwalKuota,
} from "@/services/sapa-asn.services";

const JadwalKuotaSettings = () => {
  const queryClient = useQueryClient();
  const [editModal, setEditModal] = useState({ open: false, jadwal: null });
  const [newKuota, setNewKuota] = useState(10);

  // Get jadwal list
  const { data: jadwalList, isLoading } = useQuery({
    queryKey: ["admin-jadwal-advokasi"],
    queryFn: () => getAdminJadwalAdvokasi(),
  });

  // Update kuota mutation
  const { mutate: updateKuota, isLoading: updating } = useMutation({
    mutationFn: ({ id, kuota_maksimal }) => updateAdminJadwalKuota(id, { kuota_maksimal }),
    onSuccess: (data) => {
      message.success(data.message || "Kuota berhasil diperbarui");
      queryClient.invalidateQueries(["admin-jadwal-advokasi"]);
      setEditModal({ open: false, jadwal: null });
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || "Gagal memperbarui kuota");
    },
  });

  const handleEditKuota = (jadwal) => {
    setNewKuota(jadwal.kuota_maksimal || 10);
    setEditModal({ open: true, jadwal });
  };

  const handleSaveKuota = () => {
    if (!editModal.jadwal) return;
    updateKuota({ id: editModal.jadwal.id, kuota_maksimal: newKuota });
  };

  const columns = [
    {
      title: "Tanggal",
      dataIndex: "tanggal_konsultasi",
      key: "tanggal",
      width: 150,
      render: (val) => (
        <Group gap={6}>
          <IconCalendar size={14} />
          <Text size="xs">{val ? dayjs(val).format("dddd, DD MMM YYYY") : "-"}</Text>
        </Group>
      ),
    },
    {
      title: "Waktu",
      key: "waktu",
      width: 120,
      render: (_, record) => (
        <Text size="xs">{record.waktu_mulai} - {record.waktu_selesai}</Text>
      ),
    },
    {
      title: "Kuota",
      key: "kuota",
      width: 150,
      render: (_, record) => {
        const terisi = record.advokasi_list?.filter(
          (a) => !["Cancelled", "Ditolak", "Rejected"].includes(a.status)
        ).length || 0;
        const tersedia = Math.max(0, (record.kuota_maksimal || 10) - terisi);
        
        return (
          <Group gap={6}>
            <Badge color={tersedia > 0 ? "green" : "red"} variant="light" size="sm">
              {terisi} / {record.kuota_maksimal || 10}
            </Badge>
            <Text size="xs" c="dimmed">({tersedia} tersedia)</Text>
          </Group>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (val) => (
        <Tag color={val === "active" ? "green" : "gray"}>
          {val === "active" ? "Aktif" : "Nonaktif"}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 100,
      render: (_, record) => (
        <Button
          size="small"
          icon={<IconSettings size={14} />}
          onClick={() => handleEditKuota(record)}
        >
          Kuota
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 3 }} />;
  }

  return (
    <>
      <Paper p="md" radius="md" withBorder mb="md">
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <ThemeIcon color="indigo" variant="light" size="md">
              <IconCalendar size={16} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="sm">Pengaturan Jadwal & Kuota</Text>
              <Text size="xs" c="dimmed">Atur kuota per sesi advokasi</Text>
            </div>
          </Group>
        </Group>

        <Table
          columns={columns}
          dataSource={jadwalList || []}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 600 }}
        />
      </Paper>

      {/* Edit Kuota Modal */}
      <Modal
        title={
          <Group gap="xs">
            <IconUsers size={18} />
            <Text fw={600}>Ubah Kuota</Text>
          </Group>
        }
        open={editModal.open}
        onCancel={() => setEditModal({ open: false, jadwal: null })}
        onOk={handleSaveKuota}
        confirmLoading={updating}
        okText="Simpan"
        cancelText="Batal"
      >
        {editModal.jadwal && (
          <Stack gap="md">
            <Paper p="sm" bg="gray.0" radius="sm">
              <SimpleGrid cols={2} spacing="xs">
                <div>
                  <Text size="xs" c="dimmed">Tanggal</Text>
                  <Text size="sm" fw={500}>
                    {dayjs(editModal.jadwal.tanggal_konsultasi).format("dddd, DD MMM YYYY")}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">Waktu</Text>
                  <Text size="sm" fw={500}>
                    {editModal.jadwal.waktu_mulai} - {editModal.jadwal.waktu_selesai}
                  </Text>
                </div>
              </SimpleGrid>
            </Paper>

            <div>
              <Text size="xs" c="dimmed" mb={4}>Pendaftar Aktif Saat Ini</Text>
              <Badge color="blue" size="lg">
                {editModal.jadwal.advokasi_list?.filter(
                  (a) => !["Cancelled", "Ditolak", "Rejected"].includes(a.status)
                ).length || 0} orang
              </Badge>
            </div>

            <div>
              <Text size="xs" c="dimmed" mb={4}>Kuota Maksimal</Text>
              <InputNumber
                min={1}
                max={100}
                value={newKuota}
                onChange={(val) => setNewKuota(val)}
                style={{ width: "100%" }}
                addonAfter="orang"
              />
              <Text size="xs" c="dimmed" mt={4}>
                * Kuota tidak dapat diubah di bawah jumlah pendaftar aktif
              </Text>
            </div>
          </Stack>
        )}
      </Modal>
    </>
  );
};

export default JadwalKuotaSettings;

