import { Accordion, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconBuilding,
  IconCalendar,
  IconEye,
  IconFile,
  IconFileText,
  IconFilter,
  IconGavel,
  IconHash,
  IconInfoCircle,
  IconMail,
  IconPhone,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconUsers,
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
  Rejected: { color: "red", label: "Ditolak" },
  Pending: { color: "orange", label: "Menunggu" },
  "In Progress": { color: "blue", label: "Sedang Diproses" },
  Completed: { color: "cyan", label: "Selesai" },
};

const jenisPerkaraLabels = {
  perdata: "Perdata",
  pidana: "Pidana",
  tun: "TUN",
  lainnya: "Lainnya",
};

const bentukPendampinganLabels = {
  kehadiran_persidangan: "Kehadiran Persidangan",
  penyusunan_dokumen: "Penyusunan Dokumen",
  konsultasi_tertulis: "Konsultasi Tertulis",
  lainnya: "Lainnya",
};

const jenisPerkaraOptions = [
  { value: "", label: "Semua Jenis" },
  { value: "perdata", label: "Perdata" },
  { value: "pidana", label: "Pidana" },
  { value: "tun", label: "TUN" },
  { value: "lainnya", label: "Lainnya" },
];

const bentukPendampinganOptions = [
  { value: "", label: "Semua Bentuk" },
  { value: "kehadiran_persidangan", label: "Kehadiran Persidangan" },
  { value: "penyusunan_dokumen", label: "Penyusunan Dokumen" },
  { value: "konsultasi_tertulis", label: "Konsultasi Tertulis" },
  { value: "lainnya", label: "Lainnya" },
];

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "Pending", label: "Menunggu" },
  { value: "Approved", label: "Disetujui" },
  { value: "In Progress", label: "Sedang Diproses" },
  { value: "Completed", label: "Selesai" },
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

const DetailModal = ({ open, onClose, data }) => {
  if (!data) return null;

  const jenisPerkara = parseJsonField(data.jenis_perkara);
  const bentukPendampingan = parseJsonField(data.bentuk_pendampingan);
  const lampiran = parseJsonField(data.lampiran_dokumen);

  return (
    <Modal
      title={
        <Group gap="xs">
          <IconInfoCircle size={18} />
          <Text size="sm" fw={600}>Detail Pendampingan</Text>
          <Tag color={statusConfig[data.status]?.color}>{statusConfig[data.status]?.label}</Tag>
        </Group>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={550}
    >
      <Accordion variant="separated" radius="sm" defaultValue={["info", "perkara"]}>
        <Accordion.Item value="info">
          <Accordion.Control icon={<IconHash size={16} />}>
            <Text size="xs" fw={600}>Informasi Permohonan</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <SimpleGrid cols={2} spacing="xs">
              <InfoItem icon={IconHash} label="No. Permohonan" value={data.nomor_permohonan || data.id} />
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

        <Accordion.Item value="perkara">
          <Accordion.Control icon={<IconFileText size={16} />}>
            <Text size="xs" fw={600}>Data Perkara</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              <SimpleGrid cols={2} spacing="xs">
                <InfoItem icon={IconHash} label="No. Perkara" value={data.no_perkara} />
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Jenis Perkara</Text>
                  <Group gap={4}>
                    {jenisPerkara.map((k, i) => (
                      <Tag key={i} style={{ fontSize: 10 }}>{jenisPerkaraLabels[k] || k}</Tag>
                    ))}
                    {data.jenis_perkara_lainnya && (
                      <Tag style={{ fontSize: 10 }}>{data.jenis_perkara_lainnya}</Tag>
                    )}
                  </Group>
                </div>
              </SimpleGrid>
              <SimpleGrid cols={2} spacing="xs">
                <InfoItem icon={IconBuilding} label="Tempat Pengadilan" value={data.tempat_pengadilan || data.pengadilan_jadwal} />
                <InfoItem 
                  icon={IconCalendar} 
                  label="Jadwal Sidang" 
                  value={data.jadwal_pengadilan ? dayjs(data.jadwal_pengadilan).format("DD MMM YYYY, HH:mm") : "-"} 
                />
              </SimpleGrid>
              <div>
                <Text size="xs" c="dimmed" mb={4}>Ringkasan Perkara</Text>
                <Paper p="xs" bg="gray.0" radius="sm">
                  <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>{data.ringkasan_perkara || "-"}</Text>
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

        <Accordion.Item value="pendampingan">
          <Accordion.Control icon={<IconGavel size={16} />}>
            <Text size="xs" fw={600}>Permohonan Pendampingan</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              <div>
                <Text size="xs" c="dimmed" mb={4}>Bentuk Pendampingan</Text>
                <Group gap={4}>
                  {bentukPendampingan.map((k, i) => (
                    <Tag key={i} color="blue" style={{ fontSize: 10 }}>{bentukPendampinganLabels[k] || k}</Tag>
                  ))}
                  {data.bentuk_pendampingan_lainnya && (
                    <Tag color="blue" style={{ fontSize: 10 }}>{data.bentuk_pendampingan_lainnya}</Tag>
                  )}
                </Group>
              </div>
              {data.pengacara_ditugaskan && (
                <InfoItem icon={IconUsers} label="Pengacara Ditugaskan" value={data.pengacara_ditugaskan} />
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
      </Accordion>
    </Modal>
  );
};

const ListPendampinganHukum = ({ data = [], meta = {}, loading = false, query = {} }) => {
  const router = useRouter();

  const search = query.search || "";
  const jenisPerkara = query.jenisPerkara || "";
  const bentuk = query.bentuk || "";
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
      title: "No. Perkara",
      dataIndex: "no_perkara",
      key: "no_perkara",
      width: 140,
      sorter: true,
      sortOrder: sortField === "no_perkara" ? sortOrder : null,
      render: (text) => text ? (
        <Group gap={4}>
          <IconHash size={12} />
          <Text size="xs">{text}</Text>
        </Group>
      ) : <Text size="xs" c="dimmed">-</Text>,
    },
    {
      title: "Jenis Perkara",
      dataIndex: "jenis_perkara",
      key: "jenis_perkara",
      width: 120,
      render: (val) => {
        const arr = parseJsonField(val);
        return (
          <Group gap={4}>
            {arr?.slice(0, 1).map((k, i) => (
              <Tag key={i} style={{ fontSize: 10 }}>{jenisPerkaraLabels[k] || k}</Tag>
            ))}
            {arr?.length > 1 && <Tag style={{ fontSize: 10 }}>+{arr.length - 1}</Tag>}
          </Group>
        );
      },
    },
    {
      title: "Bentuk Pendampingan",
      dataIndex: "bentuk_pendampingan",
      key: "bentuk_pendampingan",
      width: 160,
      render: (val) => {
        const arr = parseJsonField(val);
        return (
          <Group gap={4}>
            {arr?.slice(0, 1).map((k, i) => (
              <Tag key={i} color="blue" style={{ fontSize: 10 }}>{bentukPendampinganLabels[k] || k}</Tag>
            ))}
            {arr?.length > 1 && <Tag style={{ fontSize: 10 }}>+{arr.length - 1}</Tag>}
          </Group>
        );
      },
    },
    {
      title: "Pengadilan",
      dataIndex: "tempat_pengadilan",
      key: "tempat_pengadilan",
      ellipsis: true,
      width: 180,
      render: (text, record) => (
        <Stack gap={0}>
          <Group gap={4}>
            <IconGavel size={12} />
            <Text size="xs">{text || record.pengadilan_jadwal?.substring(0, 25) || "-"}</Text>
          </Group>
          {record.jadwal_pengadilan && (
            <Text size="xs" c="dimmed" ml={16}>
              {dayjs(record.jadwal_pengadilan).format("DD MMM YYYY, HH:mm")}
            </Text>
          )}
        </Stack>
      ),
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
      width: 70,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Detail">
          <Button
            type="text"
            size="small"
            icon={<IconEye size={16} />}
            onClick={() => handleView(record)}
          />
        </Tooltip>
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
              onClick={() => router.push("/sapa-asn/pendampingan-hukum/create")}
            >
              Ajukan Permohonan
            </Button>
          </Group>
        </Group>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={5}>
            <Input
              placeholder="Cari no. permohonan/perkara..."
              prefix={<IconSearch size={16} />}
              value={searchValue}
              onChange={handleSearchChange}
              allowClear
              onClear={() => setSearchValue("")}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              style={{ width: "100%" }}
              placeholder="Jenis Perkara"
              options={jenisPerkaraOptions}
              value={jenisPerkara || undefined}
              onChange={(val) => updateQuery({ jenisPerkara: val, page: 1 })}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              style={{ width: "100%" }}
              placeholder="Bentuk Pendampingan"
              options={bentukPendampinganOptions}
              value={bentuk || undefined}
              onChange={(val) => updateQuery({ bentuk: val, page: 1 })}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: "100%" }}
              placeholder="Status"
              options={statusOptions}
              value={status || undefined}
              onChange={(val) => updateQuery({ status: val, page: 1 })}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
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
          scroll={{ x: 900 }}
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

export default ListPendampinganHukum;
