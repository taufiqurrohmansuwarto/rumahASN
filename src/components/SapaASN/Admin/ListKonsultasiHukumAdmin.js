import { Accordion, Avatar, Badge, Group, Paper, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconBriefcase,
  IconBuilding,
  IconCategory,
  IconDownload,
  IconEdit,
  IconFilter,
  IconHash,
  IconMail,
  IconMessageCircle,
  IconPhone,
  IconRefresh,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateAdminKonsultasiHukumStatus,
  exportAdminKonsultasiHukum,
} from "@/services/sapa-asn.services";
import { saveAs } from "file-saver";

const statusConfig = {
  Pending: { color: "orange", label: "Menunggu" },
  "In Progress": { color: "blue", label: "Diproses" },
  Completed: { color: "green", label: "Selesai" },
};

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "Pending", label: "Menunggu" },
  { value: "In Progress", label: "Diproses" },
  { value: "Completed", label: "Selesai" },
];

const jenisOptions = [
  { value: "", label: "Semua Jenis" },
  { value: "kepegawaian", label: "Kepegawaian" },
  { value: "perdata", label: "Perdata" },
  { value: "pidana", label: "Pidana" },
  { value: "tun", label: "TUN" },
  { value: "lainnya", label: "Lainnya" },
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
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: updateStatus, isLoading } = useMutation({
    mutationFn: ({ id, payload }) => updateAdminKonsultasiHukumStatus(id, payload),
    onSuccess: () => {
      message.success("Status berhasil diperbarui");
      queryClient.invalidateQueries(["admin-konsultasi-hukum"]);
      onClose();
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || "Gagal memperbarui status");
    },
  });

  if (!data) return null;

  const jenisPermasalahan = parseJsonField(data.jenis_permasalahan);
  const lampiran = parseJsonField(data.lampiran_dokumen);

  const handleSubmit = (values) => {
    updateStatus({ id: data.id, payload: values });
  };

  return (
    <Modal
      title={
        <Group gap="xs">
          <IconUser size={18} />
          <Text size="sm" fw={600}>Detail Konsultasi Hukum</Text>
        </Group>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={650}
    >
      <Stack gap="md">
        <Accordion variant="separated" radius="sm" defaultValue={[]}>
          <Accordion.Item value="user">
            <Accordion.Control icon={<IconUser size={16} />}>
              <Text size="xs" fw={600}>Informasi Pemohon</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <SimpleGrid cols={2} spacing="xs">
                <InfoItem icon={IconUser} label="Nama" value={data.user?.username} />
                <InfoItem icon={IconHash} label="NIP" value={data.user?.employee_number} />
                <InfoItem icon={IconBriefcase} label="Jabatan" value={data.user?.nama_jabatan} />
                <InfoItem icon={IconBuilding} label="Perangkat Daerah" value={data.user?.perangkat_daerah_detail} />
                <InfoItem icon={IconPhone} label="No. HP" value={data.no_hp_user} />
                <InfoItem icon={IconMail} label="Email" value={data.email_user} />
              </SimpleGrid>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="detail">
            <Accordion.Control icon={<IconCategory size={16} />}>
              <Text size="xs" fw={600}>Detail Konsultasi</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="xs">
                <InfoItem icon={IconHash} label="ID" value={data.id} />
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Jenis Permasalahan</Text>
                  <Group gap={4}>
                    {jenisPermasalahan.map((j, i) => (
                      <Tag key={i} style={{ fontSize: 10 }}>{j}</Tag>
                    ))}
                  </Group>
                </div>
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Ringkasan Permasalahan</Text>
                  <Paper p="xs" bg="gray.0" radius="sm">
                    <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>
                      {data.ringkasan_permasalahan || "-"}
                    </Text>
                  </Paper>
                </div>
                {lampiran.length > 0 && (
                  <div>
                    <Text size="xs" c="dimmed" mb={4}>Lampiran</Text>
                    <Stack gap={4}>
                      {lampiran.map((file, i) => (
                        <a key={i} href={file.url} target="_blank" rel="noopener noreferrer">
                          <Badge variant="light" size="sm">{file.name}</Badge>
                        </a>
                      ))}
                    </Stack>
                  </div>
                )}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        {/* Chat Thread Button */}
        <Button
          type="default"
          icon={<IconMessageCircle size={16} />}
          onClick={() => router.push(`/sapa-asn/admin/konsultasi-hukum/threads/${data.id}`)}
        >
          Buka Thread Chat
        </Button>

        {/* Update Status Form */}
        <Paper p="md" radius="md" withBorder>
          <Text size="sm" fw={600} mb="sm">Update Status</Text>
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: data.status }}>
            <Form.Item 
              name="status" 
              label="Status" 
              rules={[{ required: true, message: "Pilih status" }]}
              extra={
                <Text size="xs" c="dimmed" mt={4}>
                  <b>Pending:</b> Menunggu ditangani admin | <b>In Progress:</b> Sedang ditangani/dibalas | <b>Completed:</b> Konsultasi selesai
                </Text>
              }
            >
              <Select
                options={[
                  { value: "Pending", label: "Pending - Menunggu Ditangani" },
                  { value: "In Progress", label: "In Progress - Sedang Ditangani" },
                  { value: "Completed", label: "Completed - Konsultasi Selesai" },
                ]}
              />
            </Form.Item>
            <Form.Item name="respon" label="Respon/Catatan (Opsional)">
              <Input.TextArea rows={3} placeholder="Respon atau catatan untuk pemohon..." />
            </Form.Item>
            <Group justify="flex-end" gap="sm">
              <Button onClick={onClose}>Batal</Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>Simpan</Button>
            </Group>
          </Form>
        </Paper>
      </Stack>
    </Modal>
  );
};

const ListKonsultasiHukumAdmin = ({ data = [], meta = {}, loading = false, query = {}, onRefresh }) => {
  const router = useRouter();

  const search = query.search || "";
  const status = query.status || "";
  const jenis = query.jenis || "";
  const startDate = query.startDate || "";
  const endDate = query.endDate || "";
  const sortField = query.sortField || "";
  const sortOrder = query.sortOrder || "";
  const page = parseInt(query.page) || meta?.page || 1;
  const pageSize = parseInt(query.limit) || meta?.limit || 10;
  const total = meta?.total || data.length;

  const [searchValue, setSearchValue] = useState(search);
  const [debouncedSearch] = useDebouncedValue(searchValue, 500);
  const [exporting, setExporting] = useState(false);

  const selectedData = query.selectedId ? data.find((d) => d.id === query.selectedId) : null;
  const modalOpen = !!query.selectedId;

  const updateQuery = (newParams) => {
    const updatedQuery = { ...query, ...newParams };
    Object.keys(updatedQuery).forEach((key) => {
      if (!updatedQuery[key]) delete updatedQuery[key];
    });
    router.push({ pathname: router.pathname, query: updatedQuery }, undefined, { shallow: true });
  };

  useEffect(() => {
    if (debouncedSearch !== search) {
      updateQuery({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  const handleView = (record) => updateQuery({ selectedId: record.id });

  const handleCloseModal = () => {
    const { selectedId, ...rest } = query;
    router.push({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
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

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await exportAdminKonsultasiHukum({ status, jenis, startDate, endDate });
      saveAs(response.data, `konsultasi-hukum-${dayjs().format("YYYYMMDD")}.xlsx`);
      message.success("Data berhasil diexport");
    } catch (err) {
      message.error("Gagal mengexport data");
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    { title: "No", key: "no", width: 50, align: "center", render: (_, __, idx) => (page - 1) * pageSize + idx + 1 },
    { 
      title: "ID", 
      dataIndex: "id", 
      key: "id", 
      width: 140, 
      render: (id, record) => (
        <Group gap={6}>
          <Text size="xs" fw={600}>{id}</Text>
          {record.unread_count_admin > 0 && (
            <Badge color="red" size="xs" circle>{record.unread_count_admin}</Badge>
          )}
        </Group>
      ),
    },
    {
      title: "Pemohon",
      key: "user",
      width: 200,
      render: (_, record) => (
        <Group gap={6} wrap="nowrap" align="center">
          <Avatar src={record.user?.image} size={28} radius="xl" color="teal">
            {record.user?.username?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Stack gap={0} style={{ minWidth: 0 }}>
            <Text size="xs" fw={500} lineClamp={1} style={{ lineHeight: 1.2 }}>{record.user?.username || "-"}</Text>
            <Text size="10px" c="dimmed" lineClamp={1} style={{ lineHeight: 1.2 }}>{record.user?.perangkat_daerah_detail || "-"}</Text>
          </Stack>
        </Group>
      ),
    },
    {
      title: "Jenis",
      dataIndex: "jenis_permasalahan",
      key: "jenis_permasalahan",
      width: 150,
      render: (val) => {
        const arr = parseJsonField(val);
        return (
          <Group gap={4}>
            {arr.slice(0, 2).map((j, i) => <Tag key={i} style={{ fontSize: 10 }}>{j}</Tag>)}
            {arr.length > 2 && <Tag style={{ fontSize: 10 }}>+{arr.length - 2}</Tag>}
          </Group>
        );
      },
    },
    {
      title: "Tgl Usul",
      dataIndex: "created_at",
      key: "created_at",
      width: 100,
      sorter: true,
      sortOrder: sortField === "created_at" ? sortOrder : null,
      render: (text) => <Text size="xs">{text ? dayjs(text).format("DD MMM YY") : "-"}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (s) => <Tag color={statusConfig[s]?.color}>{statusConfig[s]?.label || s}</Tag>,
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Group gap={4} wrap="nowrap" justify="center">
          <Button 
            type="primary" 
            size="small" 
            icon={<IconMessageCircle size={14} />} 
            onClick={() => router.push(`/sapa-asn/admin/konsultasi-hukum/threads/${record.id}`)}
          />
          <Button 
            size="small" 
            icon={<IconEdit size={14} />} 
            onClick={() => handleView(record)} 
          />
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
            <Button icon={<IconRefresh size={16} />} onClick={handleReset}>Reset</Button>
            <Button icon={<IconDownload size={16} />} onClick={handleExport} loading={exporting}>Export</Button>
          </Group>
        </Group>
        <Row gutter={[12, 12]} align="bottom">
          <Col xs={24} sm={12} md={6}>
            <Text size="xs" c="dimmed" mb={2}>Pencarian</Text>
            <Input
              placeholder="Cari ID / ringkasan..."
              prefix={<IconSearch size={16} />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text size="xs" c="dimmed" mb={2}>Jenis Permasalahan</Text>
            <Select
              style={{ width: "100%" }}
              placeholder="Semua Jenis"
              options={jenisOptions}
              value={jenis || undefined}
              onChange={(val) => updateQuery({ jenis: val, page: 1 })}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text size="xs" c="dimmed" mb={2}>Status</Text>
            <Select
              style={{ width: "100%" }}
              placeholder="Semua Status"
              options={statusOptions}
              value={status || undefined}
              onChange={(val) => updateQuery({ status: val, page: 1 })}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text size="xs" c="dimmed" mb={2}>Tanggal Usul</Text>
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              placeholder={["Dari", "Sampai"]}
              value={startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null}
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
          pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (t) => `Total ${t} data` }}
        />
      </Paper>

      <DetailModal open={modalOpen} onClose={handleCloseModal} data={selectedData} />
    </Stack>
  );
};

export default ListKonsultasiHukumAdmin;

