import { Accordion, Alert, Badge, Group, Paper, SimpleGrid, Stack, Text, Timeline } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconCalendar,
  IconCalendarEvent,
  IconCategory,
  IconCheck,
  IconClock,
  IconEye,
  IconFilter,
  IconHash,
  IconHourglass,
  IconInfoCircle,
  IconLock,
  IconMail,
  IconPhone,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import {
  Button,
  Col,
  DatePicker,
  Input,
  Modal,
  Row,
  Select,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const statusConfig = {
  Pending: { color: "orange", label: "Menunggu Konfirmasi", icon: IconHourglass },
  Diterima: { color: "blue", label: "Diterima", icon: IconCheck },
  Approved: { color: "blue", label: "Disetujui", icon: IconCheck },
  Scheduled: { color: "cyan", label: "Terjadwal", icon: IconCalendarEvent },
  "In Progress": { color: "purple", label: "Sedang Berlangsung", icon: IconVideo },
  Completed: { color: "green", label: "Selesai", icon: IconCheck },
  Rejected: { color: "red", label: "Ditolak", icon: IconX },
  Ditolak: { color: "red", label: "Ditolak", icon: IconX },
  Cancelled: { color: "gray", label: "Dibatalkan", icon: IconX },
};

const kategoriLabels = {
  kontrak_perjanjian: "Kontrak/Perjanjian",
  kepegawaian_disiplin: "Kepegawaian & Disiplin",
  sengketa_aset: "Sengketa Aset/Keuangan",
  regulasi_produk_hukum: "Regulasi/Produk Hukum",
  lainnya: "Lainnya",
};

const kategoriOptions = [
  { value: "", label: "Semua Kategori" },
  { value: "kontrak_perjanjian", label: "Kontrak/Perjanjian" },
  { value: "kepegawaian_disiplin", label: "Kepegawaian & Disiplin" },
  { value: "sengketa_aset", label: "Sengketa Aset/Keuangan" },
  { value: "regulasi_produk_hukum", label: "Regulasi/Produk Hukum" },
  { value: "lainnya", label: "Lainnya" },
];

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "Pending", label: "Menunggu Konfirmasi" },
  { value: "Diterima", label: "Diterima" },
  { value: "Scheduled", label: "Terjadwal" },
  { value: "In Progress", label: "Sedang Berlangsung" },
  { value: "Completed", label: "Selesai" },
  { value: "Ditolak", label: "Ditolak" },
  { value: "Cancelled", label: "Dibatalkan" },
];

const InfoItem = ({ icon: Icon, label, value }) => (
  <Group gap={6} align="flex-start" wrap="nowrap">
    <Icon size={14} color="#666" style={{ marginTop: 2, flexShrink: 0 }} />
    <Stack gap={0}>
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size="xs" fw={500}>{value || "-"}</Text>
    </Stack>
  </Group>
);

const parseJsonField = (field) => {
  if (!field) return [];
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  }
  return field;
};

const getStatusTimeline = (status, jadwal) => {
  const steps = [
    { title: "Pengajuan", desc: "Menunggu konfirmasi admin", status: "completed" },
    { title: "Konfirmasi", desc: "Disetujui/Ditolak oleh admin", status: "pending" },
    { title: "Sesi Konsultasi", desc: jadwal?.tanggal_konsultasi ? dayjs(jadwal.tanggal_konsultasi).format("dddd, D MMMM YYYY") : "Belum dijadwalkan", status: "pending" },
    { title: "Selesai", desc: "Sesi telah selesai", status: "pending" },
  ];

  switch (status) {
    case "Pending":
      steps[0].status = "completed";
      steps[1].status = "active";
      break;
    case "Diterima":
    case "Approved":
    case "Scheduled":
      steps[0].status = "completed";
      steps[1].status = "completed";
      steps[2].status = "active";
      break;
    case "In Progress":
      steps[0].status = "completed";
      steps[1].status = "completed";
      steps[2].status = "active";
      break;
    case "Completed":
      steps[0].status = "completed";
      steps[1].status = "completed";
      steps[2].status = "completed";
      steps[3].status = "completed";
      break;
    case "Ditolak":
    case "Rejected":
      steps[0].status = "completed";
      steps[1].status = "error";
      break;
    case "Cancelled":
      steps[0].status = "completed";
      steps[1].status = "cancelled";
      break;
    default:
      break;
  }
  return steps;
};

const DetailModal = ({ open, onClose, data }) => {
  if (!data) return null;

  const kategoriIsu = parseJsonField(data.kategori_isu);
  const isSensitif = data.is_sensitive;
  const jadwal = data.jadwal;
  const timeline = getStatusTimeline(data.status, jadwal);

  const getTimelineColor = (status) => {
    switch (status) {
      case "completed": return "green";
      case "active": return "blue";
      case "error": return "red";
      case "cancelled": return "gray";
      default: return "gray";
    }
  };

  return (
    <Modal
      title={
        <Group gap="xs">
          <IconInfoCircle size={18} />
          <Text size="sm" fw={600}>Detail Permohonan</Text>
          <Tag color={statusConfig[data.status]?.color}>{statusConfig[data.status]?.label || data.status}</Tag>
        </Group>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Stack gap="md">
        {/* Jadwal Info - Highlight */}
        {jadwal?.tanggal_konsultasi && (
          <Alert 
            icon={<IconCalendarEvent size={18} />} 
            color={data.status === "Pending" ? "orange" : "blue"}
            variant="light"
            title="Jadwal Konsultasi yang Diajukan"
          >
            <Stack gap={4}>
              <Group gap="lg">
                <div>
                  <Text size="xs" c="dimmed">Hari & Tanggal</Text>
                  <Text size="sm" fw={600}>
                    {dayjs(jadwal.tanggal_konsultasi).format("dddd, D MMMM YYYY")}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">Waktu</Text>
                  <Text size="sm" fw={600}>
                    {jadwal.waktu_mulai || "10:00"} - {jadwal.waktu_selesai || "12:00"} WIB
                  </Text>
                </div>
              </Group>
              <Group gap={4}>
                <IconVideo size={14} />
                <Text size="xs">Sesi dilakukan secara Daring (Video Conference)</Text>
              </Group>
            </Stack>
          </Alert>
        )}

        {/* Timeline Status */}
        <Paper p="md" radius="md" bg="gray.0">
          <Text size="xs" fw={600} mb="sm">Status Permohonan</Text>
          <Timeline active={timeline.findIndex(t => t.status === "active")} bulletSize={20} lineWidth={2}>
            {timeline.map((step, idx) => (
              <Timeline.Item
                key={idx}
                color={getTimelineColor(step.status)}
                title={<Text size="xs" fw={500}>{step.title}</Text>}
                bullet={step.status === "completed" ? <IconCheck size={12} /> : step.status === "error" ? <IconX size={12} /> : null}
              >
                <Text size="xs" c="dimmed">{step.desc}</Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </Paper>

        <Accordion variant="separated" radius="sm" defaultValue={["info"]}>
          <Accordion.Item value="info">
            <Accordion.Control icon={<IconHash size={16} />}>
              <Text size="xs" fw={600}>Informasi Permohonan</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <SimpleGrid cols={2} spacing="xs">
                <InfoItem icon={IconHash} label="No. Permohonan" value={data.nomor_permohonan || data.id} />
                <InfoItem 
                  icon={IconCalendar} 
                  label="Tanggal Pengajuan" 
                  value={data.created_at ? dayjs(data.created_at).format("DD MMM YYYY, HH:mm") : "-"} 
                />
                <InfoItem icon={IconPhone} label="HP/WA" value={data.no_hp_user} />
                <InfoItem icon={IconMail} label="Email" value={data.email_user} />
              </SimpleGrid>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="topik">
            <Accordion.Control icon={<IconCategory size={16} />}>
              <Text size="xs" fw={600}>Topik Konsultasi</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="xs">
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Kategori</Text>
                  <Group gap={4}>
                    {kategoriIsu.map((k, i) => (
                      <Tag key={i} style={{ fontSize: 10 }}>
                        {kategoriLabels[k] || k}
                      </Tag>
                    ))}
                    {data.kategori_lainnya && (
                      <Tag color="purple" style={{ fontSize: 10 }}>{data.kategori_lainnya}</Tag>
                    )}
                  </Group>
                </div>
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Sensitif</Text>
                  <Badge size="sm" color={isSensitif ? "red" : "gray"} variant="light">
                    {isSensitif ? "Ya - Rahasia" : "Tidak"}
                  </Badge>
                </div>
                {!isSensitif && data.poin_konsultasi && (
                  <div>
                    <Text size="xs" c="dimmed" mb={4}>Poin Konsultasi</Text>
                    <Paper p="xs" bg="gray.0" radius="sm">
                      <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>{data.poin_konsultasi}</Text>
                    </Paper>
                  </div>
                )}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          {(data.alasan_tolak || data.catatan) && (
            <Accordion.Item value="catatan">
              <Accordion.Control icon={<IconInfoCircle size={16} />}>
                <Text size="xs" fw={600}>Catatan Admin</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  {data.alasan_tolak && (
                    <Alert color="red" variant="light" title="Alasan Penolakan">
                      <Text size="xs">{data.alasan_tolak}</Text>
                    </Alert>
                  )}
                  {data.catatan && (
                    <div>
                      <Text size="xs" c="dimmed" mb={4}>Catatan</Text>
                      <Text size="xs">{data.catatan}</Text>
                    </div>
                  )}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          )}
        </Accordion>
      </Stack>
    </Modal>
  );
};

const ListAdvokasi = ({ data = [], meta = {}, loading = false, query = {} }) => {
  const router = useRouter();

  const search = query.search || "";
  const kategori = query.kategori || "";
  const status = query.status || "";
  const startDate = query.startDate || "";
  const endDate = query.endDate || "";
  const sortField = query.sortField || "";
  const sortOrder = query.sortOrder || "";
  const page = parseInt(query.page) || meta?.page || 1;
  const pageSize = parseInt(query.limit) || meta?.limit || 10;
  const total = meta?.total || data.length;

  const [searchValue, setSearchValue] = useState(search);
  const [debouncedSearch] = useDebouncedValue(searchValue, 500);

  const selectedData = query.selectedId
    ? data.find((d) => d.id === query.selectedId)
    : null;
  const modalOpen = !!query.selectedId;

  const updateQuery = (newParams) => {
    const updatedQuery = { ...query, ...newParams };
    Object.keys(updatedQuery).forEach((key) => {
      if (!updatedQuery[key]) delete updatedQuery[key];
    });
    router.push({ pathname: router.pathname, query: updatedQuery }, undefined, {
      shallow: true,
    });
  };

  useEffect(() => {
    if (debouncedSearch !== search) {
      updateQuery({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleView = (record) => {
    updateQuery({ selectedId: record.id });
  };

  const handleCloseModal = () => {
    const { selectedId, ...rest } = query;
    router.push({ pathname: router.pathname, query: rest }, undefined, {
      shallow: true,
    });
  };

  const handleTableChange = (pagination, filters, sorter) => {
    updateQuery({
      page: pagination.current,
      limit: pagination.pageSize,
      sortField: sorter.field || "",
      sortOrder: sorter.order || "",
    });
  };

  const handleReset = () => {
    setSearchValue("");
    router.push({ pathname: router.pathname }, undefined, { shallow: true });
  };

  const columns = [
    {
      title: "No",
      key: "no",
      width: 50,
      align: "center",
      render: (_, __, idx) => (page - 1) * pageSize + idx + 1,
    },
    {
      title: "No. Permohonan",
      dataIndex: "id",
      key: "id",
      width: 140,
      sorter: true,
      sortOrder: sortField === "id" ? sortOrder : null,
      render: (id, record) => (
        <Text size="xs" fw={600}>{record.nomor_permohonan || id}</Text>
      ),
    },
    {
      title: "Kategori",
      dataIndex: "kategori_isu",
      key: "kategori_isu",
      width: 180,
      render: (val) => {
        const arr = parseJsonField(val);
        return (
          <Group gap={4}>
            {arr?.slice(0, 2).map((k, i) => (
              <Tag key={i} style={{ fontSize: 10 }}>{kategoriLabels[k] || k}</Tag>
            ))}
            {arr?.length > 2 && <Tag style={{ fontSize: 10 }}>+{arr.length - 2}</Tag>}
          </Group>
        );
      },
    },
    {
      title: "Sensitif",
      dataIndex: "is_sensitive",
      key: "is_sensitive",
      width: 80,
      align: "center",
      render: (val) => (
        <Badge color={val ? "red" : "gray"} variant="light" size="sm">
          {val ? <IconLock size={12} /> : "Tidak"}
        </Badge>
      ),
    },
    {
      title: "Jadwal Konsultasi",
      key: "jadwal",
      width: 180,
      render: (_, record) => {
        const jadwal = record.jadwal;
        if (!jadwal?.tanggal_konsultasi) {
          return <Text size="xs" c="dimmed">Belum dijadwalkan</Text>;
        }
        return (
          <Stack gap={2}>
            <Group gap={4}>
              <IconCalendarEvent size={12} />
              <Text size="xs" fw={500}>
                {dayjs(jadwal.tanggal_konsultasi).format("ddd, D MMM YYYY")}
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {jadwal.waktu_mulai || "10:00"} - {jadwal.waktu_selesai || "12:00"}
            </Text>
          </Stack>
        );
      },
    },
    {
      title: "Tgl Pengajuan",
      dataIndex: "created_at",
      key: "created_at",
      width: 100,
      sorter: true,
      sortOrder: sortField === "created_at" ? sortOrder : null,
      render: (text) => (
        <Text size="xs">{text ? dayjs(text).format("DD MMM YY") : "-"}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      sorter: true,
      sortOrder: sortField === "status" ? sortOrder : null,
      render: (status) => (
        <Tag color={statusConfig[status]?.color}>
          {statusConfig[status]?.label || status}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 70,
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<IconEye size={16} />}
          onClick={() => handleView(record)}
        />
      ),
    },
  ];

  return (
    <Stack gap="md">
      <Paper p="md" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <IconFilter size={18} />
            <Text fw={600}>Filter</Text>
          </Group>
          <Group gap="xs">
            <Button icon={<IconRefresh size={16} />} onClick={handleReset}>
              Reset
            </Button>
            <Button
              type="primary"
              icon={<IconPlus size={16} />}
              onClick={() => router.push("/sapa-asn/advokasi/create")}
            >
              Ajukan Permohonan
            </Button>
          </Group>
        </Group>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Cari no. permohonan..."
              prefix={<IconSearch size={16} />}
              value={searchValue}
              onChange={handleSearchChange}
              allowClear
              onClear={() => setSearchValue("")}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Kategori"
              options={kategoriOptions}
              value={kategori || undefined}
              onChange={(val) => updateQuery({ kategori: val, page: 1 })}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Status"
              options={statusOptions}
              value={status || undefined}
              onChange={(val) => updateQuery({ status: val, page: 1 })}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              placeholder={["Dari", "Sampai"]}
              value={
                startDate && endDate
                  ? [dayjs(startDate), dayjs(endDate)]
                  : null
              }
              onChange={(dates) =>
                updateQuery({
                  startDate: dates?.[0]?.format("YYYY-MM-DD") || "",
                  endDate: dates?.[1]?.format("YYYY-MM-DD") || "",
                  page: 1,
                })
              }
            />
          </Col>
        </Row>
      </Paper>

      <Paper p="md" radius="md" withBorder>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          size="middle"
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (t) => `Total ${t} data`,
          }}
        />
      </Paper>

      <DetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        data={selectedData}
      />
    </Stack>
  );
};

export default ListAdvokasi;
