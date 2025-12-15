import { Accordion, Avatar, Badge, Group, Paper, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconBriefcase,
  IconBuilding,
  IconCategory,
  IconDownload,
  IconEdit,
  IconFileUpload,
  IconFilter,
  IconHash,
  IconMail,
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
  Upload,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateAdminPendampinganHukumStatus,
  exportAdminPendampinganHukum,
  downloadAdminPendampinganHukum,
} from "@/services/sapa-asn.services";
import { saveAs } from "file-saver";

const statusConfig = {
  Pending: { color: "orange", label: "Menunggu" },
  Diterima: { color: "blue", label: "Diterima" },
  Approved: { color: "blue", label: "Disetujui" },
  "In Progress": { color: "purple", label: "Berlangsung" },
  Completed: { color: "green", label: "Selesai" },
  Ditolak: { color: "red", label: "Ditolak" },
  Rejected: { color: "red", label: "Ditolak" },
};

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "Pending", label: "Menunggu" },
  { value: "Diterima", label: "Diterima" },
  { value: "In Progress", label: "Berlangsung" },
  { value: "Completed", label: "Selesai" },
  { value: "Ditolak", label: "Ditolak" },
];

const jenisPerkaraOptions = [
  { value: "", label: "Semua Jenis" },
  { value: "pidana", label: "Pidana" },
  { value: "perdata", label: "Perdata" },
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

  const { mutate: updateStatus, isLoading } = useMutation({
    mutationFn: ({ id, payload }) => updateAdminPendampinganHukumStatus(id, payload),
    onSuccess: () => {
      message.success("Status berhasil diperbarui");
      queryClient.invalidateQueries(["admin-pendampingan-hukum"]);
      onClose();
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || "Gagal memperbarui status");
    },
  });

  if (!data) return null;

  const jenisPerkara = parseJsonField(data.jenis_perkara);
  const bentukPendampingan = parseJsonField(data.bentuk_pendampingan);
  const lampiran = parseJsonField(data.lampiran_dokumen);

  const handleSubmit = (values) => {
    const { attachment_disposisi, ...rest } = values;
    
    // Check if there's a file attachment
    if (attachment_disposisi?.fileList?.length > 0) {
      const formData = new FormData();
      formData.append("status", rest.status);
      if (rest.alasan_tolak) formData.append("alasan_tolak", rest.alasan_tolak);
      if (rest.catatan) formData.append("catatan", rest.catatan);
      formData.append("attachment_disposisi", attachment_disposisi.fileList[0].originFileObj);
      updateStatus({ id: data.id, payload: formData });
    } else {
      updateStatus({ id: data.id, payload: rest });
    }
  };

  return (
    <Modal
      title={
        <Group gap="xs">
          <IconUser size={18} />
          <Text size="sm" fw={600}>Detail Pendampingan Hukum</Text>
        </Group>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
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
              <Text size="xs" fw={600}>Detail Perkara</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="xs">
                <SimpleGrid cols={2} spacing="xs">
                  <InfoItem icon={IconHash} label="ID" value={data.id} />
                  <InfoItem icon={IconHash} label="No. Perkara" value={data.no_perkara} />
                  <InfoItem icon={IconCategory} label="Tempat Pengadilan" value={data.tempat_pengadilan} />
                  <InfoItem icon={IconCategory} label="Jadwal Sidang" value={data.jadwal_pengadilan ? dayjs(data.jadwal_pengadilan).format("DD MMM YYYY, HH:mm") : "-"} />
                </SimpleGrid>
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Jenis Perkara</Text>
                  <Group gap={4}>
                    {jenisPerkara.map((j, i) => <Tag key={i} style={{ fontSize: 10 }}>{j}</Tag>)}
                  </Group>
                </div>
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Bentuk Pendampingan</Text>
                  <Group gap={4}>
                    {bentukPendampingan.map((b, i) => <Tag key={i} color="blue" style={{ fontSize: 10 }}>{b}</Tag>)}
                  </Group>
                </div>
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Ringkasan Pokok Perkara</Text>
                  <Paper p="xs" bg="gray.0" radius="sm">
                    <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>{data.ringkasan_perkara || "-"}</Text>
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
                  <b>Pending:</b> Menunggu verifikasi admin | <b>Diterima:</b> Permohonan disetujui, tim akan menghubungi | <b>In Progress:</b> Proses pendampingan berlangsung | <b>Completed:</b> Pendampingan selesai | <b>Ditolak:</b> Tidak dapat diproses
                </Text>
              }
            >
              <Select
                options={[
                  { value: "Pending", label: "Pending - Menunggu Verifikasi" },
                  { value: "Diterima", label: "Diterima - Tim Akan Menghubungi" },
                  { value: "In Progress", label: "In Progress - Pendampingan Berlangsung" },
                  { value: "Ditolak", label: "Ditolak - Tidak Dapat Diproses" },
                  { value: "Completed", label: "Completed - Pendampingan Selesai" },
                ]}
              />
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.status !== cur.status}>
              {({ getFieldValue }) =>
                getFieldValue("status") === "Ditolak" ? (
                  <>
                    <Form.Item
                      name="alasan_tolak"
                      label="Alasan Penolakan"
                      rules={[{ required: true, message: "Isi alasan penolakan" }]}
                    >
                      <Input.TextArea rows={3} placeholder="Masukkan alasan penolakan..." />
                    </Form.Item>
                    <Form.Item
                      name="attachment_disposisi"
                      label="Lampiran Disposisi (Opsional)"
                    >
                      <Upload.Dragger
                        maxCount={1}
                        beforeUpload={() => false}
                        accept=".pdf,.doc,.docx"
                        style={{ padding: "12px 0" }}
                      >
                        <Group justify="center" gap={8}>
                          <IconFileUpload size={20} color="#999" />
                          <Stack gap={2} align="center">
                            <Text size="xs">Klik atau drag file ke sini</Text>
                            <Text size="xs" c="dimmed">Format PDF/DOC, ukuran ≤ 5MB</Text>
                          </Stack>
                        </Group>
                      </Upload.Dragger>
                    </Form.Item>
                  </>
                ) : null
              }
            </Form.Item>
            <Form.Item name="catatan" label="Catatan (Opsional)">
              <Input.TextArea rows={2} placeholder="Catatan untuk pemohon..." />
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

const ListPendampinganHukumAdmin = ({ data = [], meta = {}, loading = false, query = {}, onRefresh }) => {
  const router = useRouter();

  const search = query.search || "";
  const status = query.status || "";
  const jenisPerkara = query.jenisPerkara || "";
  const startDate = query.startDate || "";
  const endDate = query.endDate || "";
  const sidangStartDate = query.sidangStartDate || "";
  const sidangEndDate = query.sidangEndDate || "";
  const sortField = query.sortField || "";
  const sortOrder = query.sortOrder || "";
  const page = parseInt(query.page) || meta?.page || 1;
  const pageSize = parseInt(query.limit) || meta?.limit || 10;
  const total = meta?.total || data.length;

  const [searchValue, setSearchValue] = useState(search);
  const [debouncedSearch] = useDebouncedValue(searchValue, 500);
  const [exporting, setExporting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

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
      const response = await exportAdminPendampinganHukum({ status, jenisPerkara, startDate, endDate, sidangStartDate, sidangEndDate });
      saveAs(response.data, `pendampingan-hukum-${dayjs().format("YYYYMMDD")}.xlsx`);
      message.success("Data berhasil diexport");
    } catch (err) {
      message.error("Gagal mengexport data");
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = async (record) => {
    try {
      setDownloadingId(record.id);
      const lampiran = parseJsonField(record.lampiran_dokumen);
      const response = await downloadAdminPendampinganHukum(record.id);

      // Determine filename based on whether it has attachments
      const filename =
        lampiran.length > 0
          ? `pendampingan-${record.id}.zip`
          : `ringkasan-${record.id}.pdf`;

      saveAs(response.data, filename);
      message.success("Berhasil mengunduh data");
    } catch (err) {
      console.error(err);
      message.error("Gagal mengunduh data");
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    { title: "No", key: "no", width: 50, align: "center", render: (_, __, idx) => (page - 1) * pageSize + idx + 1 },
    { title: "ID", dataIndex: "id", key: "id", width: 140, render: (id) => <Text size="xs" fw={600}>{id}</Text> },
    {
      title: "Pemohon",
      key: "user",
      width: 200,
      render: (_, record) => (
        <Group gap={6} wrap="nowrap" align="center">
          <Avatar src={record.user?.image} size={28} radius="xl" color="grape">
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
      title: "No. Perkara",
      dataIndex: "no_perkara",
      key: "no_perkara",
      width: 140,
      render: (val) => <Text size="xs">{val || "-"}</Text>,
    },
    {
      title: "Jenis",
      dataIndex: "jenis_perkara",
      key: "jenis_perkara",
      width: 120,
      render: (val) => {
        const arr = parseJsonField(val);
        return arr.length > 0 ? <Tag style={{ fontSize: 10 }}>{arr[0]}</Tag> : "-";
      },
    },
    {
      title: "Tgl Usul",
      dataIndex: "created_at",
      key: "created_at",
      width: 90,
      sorter: true,
      sortOrder: sortField === "created_at" ? sortOrder : null,
      render: (text) => <Text size="xs">{text ? dayjs(text).format("DD MMM YY") : "-"}</Text>,
    },
    {
      title: "Tgl Sidang",
      dataIndex: "jadwal_pengadilan",
      key: "jadwal_pengadilan",
      width: 90,
      sorter: true,
      sortOrder: sortField === "jadwal_pengadilan" ? sortOrder : null,
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
        <Group gap={4} justify="center" wrap="nowrap">
          <Tooltip label="Detail">
            <Button
              type="primary"
              size="small"
              icon={<IconEdit size={14} />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip
            label={
              parseJsonField(record.lampiran_dokumen).length > 0
                ? "Download (ZIP)"
                : "Download (PDF)"
            }
          >
            <Button
              size="small"
              icon={<IconDownload size={14} />}
              loading={downloadingId === record.id}
              onClick={() => handleDownload(record)}
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
            <Button icon={<IconRefresh size={16} />} onClick={handleReset}>Reset</Button>
            <Button icon={<IconDownload size={16} />} onClick={handleExport} loading={exporting}>Export</Button>
          </Group>
        </Group>
        <Row gutter={[12, 12]} align="bottom">
          <Col xs={24} sm={12} md={6}>
            <Text size="xs" c="dimmed" mb={2}>Pencarian</Text>
            <Input
              placeholder="Cari ID / no. perkara..."
              prefix={<IconSearch size={16} />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text size="xs" c="dimmed" mb={2}>Jenis Perkara</Text>
            <Select
              style={{ width: "100%" }}
              placeholder="Semua Jenis"
              options={jenisPerkaraOptions}
              value={jenisPerkara || undefined}
              onChange={(val) => updateQuery({ jenisPerkara: val, page: 1 })}
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
          <Col xs={24} sm={12} md={6}>
            <Text size="xs" c="dimmed" mb={2}>Tanggal Sidang</Text>
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              placeholder={["Dari", "Sampai"]}
              value={sidangStartDate && sidangEndDate ? [dayjs(sidangStartDate), dayjs(sidangEndDate)] : null}
              onChange={(dates) =>
                updateQuery({
                  sidangStartDate: dates?.[0]?.format("YYYY-MM-DD") || "",
                  sidangEndDate: dates?.[1]?.format("YYYY-MM-DD") || "",
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
          scroll={{ x: 950 }}
          pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (t) => `Total ${t} data` }}
        />
      </Paper>

      <DetailModal open={modalOpen} onClose={handleCloseModal} data={selectedData} />
    </Stack>
  );
};

export default ListPendampinganHukumAdmin;

