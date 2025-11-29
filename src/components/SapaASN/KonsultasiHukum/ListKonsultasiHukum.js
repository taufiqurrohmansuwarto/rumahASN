import { Accordion, Badge, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconCalendar,
  IconCheck,
  IconEye,
  IconFile,
  IconFileText,
  IconFilter,
  IconHash,
  IconInfoCircle,
  IconMail,
  IconMessageCircle,
  IconPhone,
  IconPlus,
  IconRefresh,
  IconSearch,
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
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const statusConfig = {
  Approved: { color: "green", label: "Disetujui" },
  "Waiting for Response": { color: "orange", label: "Menunggu Respon" },
  Rejected: { color: "red", label: "Ditolak" },
  Pending: { color: "blue", label: "Menunggu" },
  Answered: { color: "cyan", label: "Sudah Dijawab" },
  Closed: { color: "gray", label: "Selesai" },
};

const jenisLabels = {
  kepegawaian: "Kepegawaian",
  perdata: "Perdata",
  administrasi_pemerintahan: "Administrasi Pemerintahan",
  lainnya: "Lainnya",
};

const jenisOptions = [
  { value: "", label: "Semua Jenis" },
  { value: "kepegawaian", label: "Kepegawaian" },
  { value: "perdata", label: "Perdata" },
  { value: "administrasi_pemerintahan", label: "Administrasi Pemerintahan" },
  { value: "lainnya", label: "Lainnya" },
];

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "Pending", label: "Menunggu" },
  { value: "Approved", label: "Disetujui" },
  { value: "Waiting for Response", label: "Menunggu Respon" },
  { value: "Answered", label: "Sudah Dijawab" },
  { value: "Closed", label: "Selesai" },
  { value: "Rejected", label: "Ditolak" },
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

const parseLampiran = (lampiran) => {
  if (!lampiran) return [];
  if (typeof lampiran === "string") {
    try {
      return JSON.parse(lampiran);
    } catch {
      return [];
    }
  }
  return lampiran;
};

const DetailModal = ({ open, onClose, data }) => {
  if (!data) return null;

  const jenisPermasalahan = data.jenis_permasalahan || [];
  const lampiran = parseLampiran(data.lampiran_dokumen);

  return (
    <Modal
      title={
        <Group gap="xs">
          <IconInfoCircle size={18} />
          <Text size="sm" fw={600}>Detail Konsultasi</Text>
          <Tag color={statusConfig[data.status]?.color}>{statusConfig[data.status]?.label}</Tag>
        </Group>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={550}
    >
      <Accordion variant="separated" radius="sm" defaultValue={["info", "ringkasan"]}>
        <Accordion.Item value="info">
          <Accordion.Control icon={<IconHash size={16} />}>
            <Text size="xs" fw={600}>Informasi Konsultasi</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <SimpleGrid cols={2} spacing="xs">
              <InfoItem icon={IconHash} label="No. Konsultasi" value={data.nomor_konsultasi || data.id} />
              <InfoItem 
                icon={IconCalendar} 
                label="Tanggal" 
                value={data.created_at ? dayjs(data.created_at).format("DD MMM YYYY") : "-"} 
              />
              <InfoItem icon={IconPhone} label="HP/WA" value={data.no_hp_user} />
              <InfoItem icon={IconMail} label="Email" value={data.email_user} />
            </SimpleGrid>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="ringkasan">
          <Accordion.Control icon={<IconFileText size={16} />}>
            <Text size="xs" fw={600}>Ringkasan Permasalahan</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              <div>
                <Text size="xs" c="dimmed" mb={4}>Jenis Permasalahan</Text>
                <Group gap={4}>
                  {jenisPermasalahan.map((k, i) => (
                    <Tag key={i} style={{ fontSize: 10 }}>{jenisLabels[k] || k}</Tag>
                  ))}
                  {data.jenis_permasalahan_lainnya && (
                    <Tag style={{ fontSize: 10 }}>{data.jenis_permasalahan_lainnya}</Tag>
                  )}
                </Group>
              </div>
              <div>
                <Text size="xs" c="dimmed" mb={4}>Ringkasan</Text>
                <Paper p="xs" bg="gray.0" radius="sm">
                  <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>{data.ringkasan_permasalahan || "-"}</Text>
                </Paper>
              </div>
              <div>
                <Text size="xs" c="dimmed" mb={4}>Lampiran</Text>
                {lampiran.length > 0 ? (
                  <Group gap={4}>
                    {lampiran.map((file, i) => (
                      <Button
                        key={i}
                        size="small"
                        icon={<IconFile size={12} />}
                        style={{ fontSize: 10 }}
                        onClick={() => window.open(file.url, "_blank")}
                      >
                        {file.name}
                      </Button>
                    ))}
                  </Group>
                ) : <Text size="xs" c="dimmed">Tidak ada</Text>}
              </div>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="respon">
          <Accordion.Control icon={<IconCheck size={16} />}>
            <Text size="xs" fw={600}>Respon</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              {data.respon_tanggal && (
                <InfoItem 
                  icon={IconCalendar} 
                  label="Tanggal Respon" 
                  value={dayjs(data.respon_tanggal).format("DD MMM YYYY")} 
                />
              )}
              {data.respon ? (
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Jawaban</Text>
                  <Paper p="xs" bg="blue.0" radius="sm">
                    <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>{data.respon}</Text>
                  </Paper>
                </div>
              ) : (
                <Text size="xs" c="dimmed">Belum ada respon</Text>
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Modal>
  );
};

const ListKonsultasiHukum = ({ data = [], meta = {}, loading = false, query = {} }) => {
  const router = useRouter();

  const search = query.search || "";
  const jenis = query.jenis || "";
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
      title: "No. Konsultasi",
      dataIndex: "id",
      key: "id",
      width: 160,
      sorter: true,
      sortOrder: sortField === "id" ? sortOrder : null,
      render: (id, record) => (
        <Group gap={6}>
          <Text size="xs" fw={600}>{record.nomor_konsultasi || id}</Text>
          {record.unread_count_user > 0 && (
            <Badge color="red" size="xs" circle>{record.unread_count_user}</Badge>
          )}
        </Group>
      ),
    },
    {
      title: "Jenis Permasalahan",
      dataIndex: "jenis_permasalahan",
      key: "jenis_permasalahan",
      width: 180,
      render: (arr) => (
        <Group gap={4}>
          {arr?.slice(0, 2).map((k, i) => (
            <Tag key={i} style={{ fontSize: 10 }}>{jenisLabels[k] || k}</Tag>
          ))}
          {arr?.length > 2 && <Tag style={{ fontSize: 10 }}>+{arr.length - 2}</Tag>}
        </Group>
      ),
    },
    {
      title: "Ringkasan",
      dataIndex: "ringkasan_permasalahan",
      key: "ringkasan_permasalahan",
      ellipsis: true,
      render: (text) => <Text size="xs">{text?.substring(0, 40)}...</Text>,
    },
    {
      title: "Lampiran",
      dataIndex: "lampiran_dokumen",
      key: "lampiran_dokumen",
      width: 80,
      align: "center",
      render: (val) => {
        const arr = parseLampiran(val);
        return arr.length > 0 ? (
          <Tooltip title={`${arr.length} file`}>
            <Button type="text" size="small" icon={<IconFile size={14} />}>
              {arr.length}
            </Button>
          </Tooltip>
        ) : <Text size="xs" c="dimmed">-</Text>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
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
      width: 90,
      align: "center",
      render: (_, record) => (
        <Group gap={4} justify="center">
          <Tooltip title="Detail">
            <Button
              type="text"
              size="small"
              icon={<IconEye size={16} />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Thread Diskusi">
            <Button
              type="text"
              size="small"
              icon={<IconMessageCircle size={16} />}
              onClick={() => router.push(`/sapa-asn/konsultasi-hukum/threads/${record.id}`)}
            />
          </Tooltip>
        </Group>
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
              onClick={() => router.push("/sapa-asn/konsultasi-hukum/create")}
            >
              Ajukan Konsultasi
            </Button>
          </Group>
        </Group>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Cari no. konsultasi..."
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
              placeholder="Jenis Permasalahan"
              options={jenisOptions}
              value={jenis || undefined}
              onChange={(val) => updateQuery({ jenis: val, page: 1 })}
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
          scroll={{ x: 800 }}
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

export default ListKonsultasiHukum;
