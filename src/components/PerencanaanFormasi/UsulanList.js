import { getOpdFasilitator } from "@/services/master.services";
import {
  createUsulan,
  deleteUsulan,
  getJabatanFungsional,
  getJabatanPelaksana,
  getLampiran,
  getPendidikan,
  getUsulan,
  updateUsulan,
  updateUsulanStatus,
} from "@/services/perencanaan-formasi.services";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  ActionIcon,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconBriefcase,
  IconBuilding,
  IconCheck,
  IconClock,
  IconDownload,
  IconEdit,
  IconFileText,
  IconHash,
  IconPaperclip,
  IconPlus,
  IconRefresh,
  IconSchool,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag,
  TreeSelect,
} from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const { TextArea } = Input;

// Status Config
const STATUS_CONFIG = {
  menunggu: { color: "orange", icon: IconClock, label: "Menunggu" },
  disetujui: { color: "green", icon: IconCheck, label: "Disetujui" },
  ditolak: { color: "red", icon: IconX, label: "Ditolak" },
  perbaikan: { color: "blue", icon: IconEdit, label: "Perbaikan" },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.menunggu;
  return <Tag color={config.color}>{config.label}</Tag>;
};

// Convert flat jabatan list to tree format for TreeSelect
const convertToTreeData = (data) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    value: item.value,
    title: item.label,
    key: item.value,
  }));
};

// Modal Create/Edit Usulan
const UsulanModal = ({ open, onClose, data, formasiId }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEdit = !!data;

  // State untuk filter tingkat pendidikan (cascading dropdown)
  const [selectedTingkat, setSelectedTingkat] = useState(null);
  const [pendidikanSearchValue, setPendidikanSearchValue] = useState("");

  // Reset states when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedTingkat(null);
      setPendidikanSearchValue("");
    }
  }, [open]);

  // Watch jenis_jabatan to conditionally fetch jabatan options
  const jenisJabatan = Form.useWatch("jenis_jabatan", form);

  // Fetch Jabatan Fungsional
  const { data: jabatanFungsional, isLoading: loadingJFT } = useQuery({
    queryKey: ["ref-jabatan-fungsional"],
    queryFn: getJabatanFungsional,
    enabled: open && jenisJabatan === "fungsional",
    staleTime: 1000 * 60 * 10,
  });

  // Fetch Jabatan Pelaksana
  const { data: jabatanPelaksana, isLoading: loadingJFU } = useQuery({
    queryKey: ["ref-jabatan-pelaksana"],
    queryFn: getJabatanPelaksana,
    enabled: open && jenisJabatan === "pelaksana",
    staleTime: 1000 * 60 * 10,
  });

  // Fetch Pendidikan
  const { data: pendidikanList, isLoading: loadingPendidikan } = useQuery({
    queryKey: ["ref-pendidikan"],
    queryFn: getPendidikan,
    enabled: open,
    staleTime: 1000 * 60 * 10,
  });

  // Fetch Unit Kerja (OPD) - Tree data
  const { data: opdTree, isLoading: loadingOpd } = useQuery({
    queryKey: ["unor-fasilitator"],
    queryFn: getOpdFasilitator,
    enabled: open,
    staleTime: 1000 * 60 * 10,
  });

  // Fetch Lampiran untuk formasi ini
  const { data: lampiranData, isLoading: loadingLampiran } = useQuery({
    queryKey: ["perencanaan-lampiran", { formasi_id: formasiId, limit: -1 }],
    queryFn: () => getLampiran({ formasi_id: formasiId, limit: -1 }),
    enabled: open && !!formasiId,
    staleTime: 1000 * 60 * 5,
  });

  // Get jabatan tree data based on jenis_jabatan
  const getJabatanTreeData = () => {
    if (jenisJabatan === "fungsional") return jabatanFungsional;
    if (jenisJabatan === "pelaksana") return jabatanPelaksana;
    return [];
  };

  const jabatanTreeData = getJabatanTreeData();
  const isLoadingJabatan = loadingJFT || loadingJFU;
  const lampiranList = lampiranData?.data || [];

  // Get unique tingkat pendidikan options for cascading dropdown
  const getTingkatPendidikanOptions = () => {
    if (!pendidikanList) return [];
    const uniqueTingkat = [
      ...new Set(pendidikanList.map((item) => item.tk_pend)),
    ];
    return uniqueTingkat
      .filter((tk) => tk) // Remove null/undefined
      .sort()
      .map((tk) => ({
        value: tk,
        label: tk,
      }));
  };

  // Filter pendidikan based on selected tingkat
  const getFilteredPendidikan = () => {
    if (!pendidikanList) return [];
    if (!selectedTingkat) return pendidikanList;
    return pendidikanList.filter((item) => item.tk_pend === selectedTingkat);
  };

  // Custom filter sort untuk prioritaskan exact match
  const pendidikanFilterSort = (optionA, optionB) => {
    const input = (pendidikanSearchValue || "").toLowerCase().trim();
    if (!input) return 0;

    const labelA = (optionA?.label || "").toLowerCase();
    const labelB = (optionB?.label || "").toLowerCase();

    // Priority 1: Exact match
    const exactA = labelA === input;
    const exactB = labelB === input;
    if (exactA && !exactB) return -1;
    if (!exactA && exactB) return 1;

    // Priority 2: Ends with exact input (e.g., "S-1 SISTEM INFORMASI" for "sistem informasi")
    const endsWithA = labelA.endsWith(input);
    const endsWithB = labelB.endsWith(input);
    if (endsWithA && !endsWithB) return -1;
    if (!endsWithA && endsWithB) return 1;

    // Priority 3: Contains input as complete word/phrase
    const wordBoundaryRegex = new RegExp(
      `\\b${input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i"
    );
    const wordMatchA = wordBoundaryRegex.test(labelA);
    const wordMatchB = wordBoundaryRegex.test(labelB);
    if (wordMatchA && !wordMatchB) return -1;
    if (!wordMatchA && wordMatchB) return 1;

    // Priority 4: Shorter label (more specific) comes first
    return labelA.length - labelB.length;
  };

  const { mutate: submit, isLoading } = useMutation(
    (values) =>
      isEdit
        ? updateUsulan(data.usulan_id, values)
        : createUsulan({ ...values, formasi_id: formasiId }),
    {
      onSuccess: () => {
        message.success(
          isEdit ? "Usulan berhasil diperbarui" : "Usulan berhasil dibuat"
        );
        queryClient.invalidateQueries(["perencanaan-usulan"]);
        form.resetFields();
        onClose();
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal menyimpan usulan"
        );
      },
    }
  );

  // Reset jabatan_id when jenis_jabatan changes
  const handleJenisJabatanChange = () => {
    form.setFieldValue("jabatan_id", undefined);
  };

  return (
    <Modal
      title={
        <Group gap="xs">
          {isEdit ? <IconEdit size={18} /> : <IconPlus size={18} />}
          <span>{isEdit ? "Edit Usulan" : "Usulan Baru"}</span>
        </Group>
      }
      open={open}
      onCancel={onClose}
      width={700}
      destroyOnClose
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Batal
          </Button>
          <Button
            type="primary"
            loading={isLoading}
            onClick={() => form.submit()}
          >
            Simpan
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={submit}
        initialValues={
          isEdit
            ? {
                jenis_jabatan: data.jenis_jabatan,
                jabatan_id: data.jabatan_id,
                kualifikasi_pendidikan: data.kualifikasi_pendidikan,
                alokasi: data.alokasi,
                unit_kerja: data.unit_kerja,
                lampiran_id: data.lampiran_id,
              }
            : { alokasi: 1 }
        }
      >
        <Form.Item
          name="jenis_jabatan"
          label={
            <Group gap={4}>
              <IconBriefcase size={14} />
              <span>Jenis Jabatan</span>
            </Group>
          }
          rules={[{ required: true, message: "Pilih jenis jabatan" }]}
        >
          <Select
            placeholder="Pilih jenis jabatan"
            onChange={handleJenisJabatanChange}
          >
            <Select.Option value="pelaksana">Jabatan Pelaksana</Select.Option>
            <Select.Option value="fungsional">Jabatan Fungsional</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="jabatan_id"
          label={
            <Group gap={4}>
              <IconFileText size={14} />
              <span>Nama Jabatan</span>
            </Group>
          }
          rules={[{ required: true, message: "Pilih nama jabatan" }]}
        >
          <TreeSelect
            placeholder={
              jenisJabatan
                ? "Ketik untuk mencari jabatan..."
                : "Pilih jenis jabatan terlebih dahulu"
            }
            disabled={!jenisJabatan}
            loading={isLoadingJabatan}
            treeData={jabatanTreeData}
            showSearch
            treeNodeFilterProp="label"
            allowClear
            style={{ width: "100%" }}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          />
        </Form.Item>

        {/* Kualifikasi Pendidikan dengan Filter Tingkat (Compact) */}
        <Form.Item
          label={
            <Group gap={4}>
              <IconSchool size={14} />
              <span>Kualifikasi Pendidikan</span>
            </Group>
          }
        >
          <Group gap="xs" align="flex-start" wrap="nowrap">
            <Select
              placeholder="Tingkat"
              allowClear
              value={selectedTingkat}
              onChange={(val) => setSelectedTingkat(val)}
              options={getTingkatPendidikanOptions()}
              showSearch
              optionFilterProp="label"
              style={{ width: 160, flexShrink: 0 }}
            />
            <Form.Item name="kualifikasi_pendidikan" noStyle>
              <Select
                mode="multiple"
                placeholder={
                  selectedTingkat
                    ? `Cari pendidikan ${selectedTingkat}...`
                    : "Cari pendidikan..."
                }
                loading={loadingPendidikan}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                filterSort={pendidikanFilterSort}
                onSearch={(value) => setPendidikanSearchValue(value)}
                options={getFilteredPendidikan().map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                style={{ flex: 1, minWidth: 0 }}
              />
            </Form.Item>
          </Group>
        </Form.Item>

        <Form.Item
          name="alokasi"
          label={
            <Group gap={4}>
              <IconHash size={14} />
              <span>Alokasi</span>
            </Group>
          }
          rules={[{ required: true, message: "Alokasi wajib diisi" }]}
        >
          <InputNumber
            min={1}
            max={1000}
            style={{ width: "100%" }}
            placeholder="Jumlah alokasi"
          />
        </Form.Item>

        <Form.Item
          name="unit_kerja"
          label={
            <Group gap={4}>
              <IconBuilding size={14} />
              <span>Unit Kerja</span>
            </Group>
          }
          rules={[{ required: true, message: "Pilih unit kerja" }]}
        >
          <TreeSelect
            placeholder="Ketik untuk mencari unit kerja..."
            loading={loadingOpd}
            treeData={opdTree}
            showSearch
            treeNodeFilterProp="label"
            allowClear
            style={{ width: "100%" }}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          />
        </Form.Item>

        <Form.Item
          name="lampiran_id"
          label={
            <Group gap={4}>
              <IconPaperclip size={14} />
              <span>Lampiran</span>
            </Group>
          }
        >
          <Select
            placeholder="Pilih lampiran (opsional)"
            allowClear
            loading={loadingLampiran}
            showSearch
            optionFilterProp="label"
            options={lampiranList.map((item) => ({
              value: item.lampiran_id,
              label: item.file_name,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Modal Verifikasi (Admin)
const VerifikasiModal = ({ open, onClose, data }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate: submit, isLoading } = useMutation(
    (values) => updateUsulanStatus(data?.usulan_id, values),
    {
      onSuccess: () => {
        message.success("Status usulan berhasil diperbarui");
        queryClient.invalidateQueries(["perencanaan-usulan"]);
        form.resetFields();
        onClose();
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal memperbarui status"
        );
      },
    }
  );

  if (!data) return null;

  const pendidikanDetail = data.kualifikasi_pendidikan_detail || [];
  const lampiranUrl = data.lampiran?.file_path || data.lampiran?.url;

  return (
    <Modal
      title={
        <Group gap="xs">
          <IconCheck size={18} />
          <span>Persetujuan Usulan</span>
        </Group>
      }
      open={open}
      onCancel={onClose}
      width={600}
      destroyOnClose
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Batal
          </Button>
          <Button
            type="primary"
            loading={isLoading}
            onClick={() => form.submit()}
          >
            OK
          </Button>
        </div>
      }
    >
      <Paper p="sm" radius="sm" withBorder mb="md" bg="gray.0">
        <Stack gap={8}>
          <Group gap="xs" align="flex-start">
            <Text size="xs" c="dimmed" w={120}>
              Jenis Jabatan:
            </Text>
            <Tag color={data.jenis_jabatan === "fungsional" ? "blue" : "green"}>
              {data.jenis_jabatan}
            </Tag>
          </Group>
          <Group gap="xs" align="flex-start">
            <Text size="xs" c="dimmed" w={120}>
              Nama Jabatan:
            </Text>
            <Text size="sm" fw={500} style={{ flex: 1 }}>
              {data.nama_jabatan || data.jabatan_id}
            </Text>
          </Group>
          <Group gap="xs" align="flex-start">
            <Text size="xs" c="dimmed" w={120}>
              Unit Kerja:
            </Text>
            <Text size="sm" fw={500} style={{ flex: 1 }}>
              {data.unit_kerja_text || data.unit_kerja}
            </Text>
          </Group>
          <Group gap="xs" align="flex-start">
            <Text size="xs" c="dimmed" w={120}>
              Alokasi:
            </Text>
            <Text size="sm" fw={600} c="blue">
              {data.alokasi} orang
            </Text>
          </Group>
          <Group gap="xs" align="flex-start">
            <Text size="xs" c="dimmed" w={120}>
              Kualifikasi:
            </Text>
            <Stack gap={2} style={{ flex: 1 }}>
              {pendidikanDetail.length > 0 ? (
                pendidikanDetail.map((item, i) => (
                  <Text key={i} size="xs">
                    <Tag color="blue" style={{ marginRight: 4 }}>
                      {item.tk_pend}
                    </Tag>
                    {item.label}
                  </Text>
                ))
              ) : (
                <Text size="xs" c="dimmed">
                  Tidak ada kualifikasi
                </Text>
              )}
            </Stack>
          </Group>
          {data.lampiran && (
            <Group gap="xs" align="flex-start">
              <Text size="xs" c="dimmed" w={120}>
                Lampiran:
              </Text>
              <a
                href={lampiranUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flex: 1 }}
              >
                <Group gap={4}>
                  <IconPaperclip size={14} />
                  <Text size="xs" c="blue">
                    {data.lampiran.file_name || "Lihat Lampiran"}
                  </Text>
                </Group>
              </a>
            </Group>
          )}
          {data.dibuatOleh && (
            <Group gap="xs" align="flex-start">
              <Text size="xs" c="dimmed" w={120}>
                Dibuat oleh:
              </Text>
              <Text size="xs">
                {data.dibuatOleh.username || data.dibuatOleh.custom_id} -{" "}
                {dayjs(data.dibuat_pada).format("DD/MM/YYYY HH:mm")}
              </Text>
            </Group>
          )}
          {data.status === "perbaikan" && data.alasan_perbaikan && (
            <Group gap="xs" align="flex-start">
              <Text size="xs" c="dimmed" w={120}>
                Alasan Perbaikan:
              </Text>
              <Text size="xs" c="red" style={{ flex: 1 }}>
                {data.alasan_perbaikan}
              </Text>
            </Group>
          )}
          {data.catatan && (
            <Group gap="xs" align="flex-start">
              <Text size="xs" c="dimmed" w={120}>
                Catatan:
              </Text>
              <Text size="xs" style={{ flex: 1 }}>
                {data.catatan}
              </Text>
            </Group>
          )}
        </Stack>
      </Paper>

      <Form
        form={form}
        layout="vertical"
        onFinish={submit}
        initialValues={{ status: data.status, catatan: data.catatan || "" }}
      >
        <Form.Item
          name="status"
          label={
            <Group gap={4}>
              <IconCheck size={14} />
              <span>Status</span>
            </Group>
          }
          rules={[{ required: true, message: "Pilih status" }]}
        >
          <Select>
            <Select.Option value="menunggu">Menunggu</Select.Option>
            <Select.Option value="disetujui">Disetujui</Select.Option>
            <Select.Option value="ditolak">Ditolak</Select.Option>
            <Select.Option value="perbaikan">Perlu Perbaikan</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="catatan"
          label={
            <Group gap={4}>
              <IconFileText size={14} />
              <span>Catatan Verifikasi</span>
            </Group>
          }
        >
          <TextArea
            rows={3}
            placeholder="Tambahkan catatan verifikasi (opsional)..."
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.status !== currentValues.status
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("status") === "perbaikan" && (
              <Form.Item
                name="alasan_perbaikan"
                label={
                  <Group gap={4}>
                    <IconFileText size={14} />
                    <span>Alasan Perbaikan</span>
                  </Group>
                }
                rules={[
                  { required: true, message: "Alasan perbaikan wajib diisi" },
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Jelaskan alasan perbaikan..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            )
          }
        </Form.Item>
      </Form>
    </Modal>
  );
};

function UsulanList({ formasiId, formasi }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.current_role === "admin";
  const queryClient = useQueryClient();

  // Get filters from URL (using kebab-case for cleaner URLs)
  const {
    page: urlPage = 1,
    limit: urlLimit = 10,
    status: urlStatus = "",
    jenis: urlJenis = "",
    search: urlSearch = "",
    "unit-kerja": urlUnitKerja = "",
  } = router.query;

  // Local state for search input (for debounce)
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);

  // Fetch Unit Kerja (OPD) Tree for filter
  const { data: opdTree, isLoading: loadingOpd } = useQuery({
    queryKey: ["unor-fasilitator"],
    queryFn: getOpdFasilitator,
    staleTime: 1000 * 60 * 10,
  });

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateFilters({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  // Sync URL search to local state on mount
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // Update URL params
  const updateFilters = useCallback(
    (newFilters) => {
      const query = { ...router.query, ...newFilters };
      Object.keys(query).forEach((key) => {
        if (!query[key] || query[key] === "") delete query[key];
      });
      router.push({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      });
    },
    [router]
  );

  // Filters object for query
  const filters = {
    page: Number(urlPage),
    limit: Number(urlLimit),
    formasi_id: formasiId,
    status: urlStatus,
    jenis_jabatan: urlJenis,
    search: urlSearch,
    unit_kerja: urlUnitKerja,
  };

  const [modal, setModal] = useState({ open: false, data: null });
  const [verifikasiModal, setVerifikasiModal] = useState({
    open: false,
    data: null,
  });

  // Fetch usulan
  const { data, isLoading, refetch } = useQuery(
    ["perencanaan-usulan", filters],
    () => getUsulan(filters),
    { keepPreviousData: true, enabled: !!formasiId }
  );

  // Delete mutation
  const { mutate: hapusUsulan, isLoading: isDeleting } = useMutation(
    (id) => deleteUsulan(id),
    {
      onSuccess: () => {
        message.success("Usulan berhasil dihapus");
        queryClient.invalidateQueries(["perencanaan-usulan"]);
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal menghapus usulan"
        );
      },
    }
  );

  // Stats
  const total = data?.meta?.total || data?.rekap?.total || 0;
  const disetujui = data?.rekap?.disetujui || 0;
  const menunggu = data?.rekap?.menunggu || 0;
  const totalAlokasi =
    data?.data?.reduce((acc, item) => acc + (item.alokasi || 0), 0) || 0;

  const columns = [
    {
      title: "No",
      key: "no",
      width: 50,
      align: "center",
      render: (_, __, index) => (filters.page - 1) * filters.limit + index + 1,
    },
    {
      title: "Jenis Jabatan",
      dataIndex: "jenis_jabatan",
      key: "jenis_jabatan",
      width: 100,
      render: (val) => (
        <Tag color={val === "fungsional" ? "blue" : "green"}>{val}</Tag>
      ),
    },
    {
      title: "Nama Jabatan",
      dataIndex: "nama_jabatan",
      key: "nama_jabatan",
      ellipsis: true,
      render: (val, record) => (
        <Text size="sm" fw={500}>
          {val || record.jabatan_id}
        </Text>
      ),
    },
    {
      title: "Kualifikasi Pendidikan",
      dataIndex: "kualifikasi_pendidikan_detail",
      key: "kualifikasi_pendidikan_detail",
      width: 200,
      render: (val) =>
        val?.length > 0 ? (
          <Stack gap={2}>
            {val.slice(0, 2).map((item, i) => (
              <Tooltip key={i} label={item.label}>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  <Tag color="blue" style={{ marginRight: 4 }}>
                    {item.tk_pend}
                  </Tag>
                  {item.label}
                </Text>
              </Tooltip>
            ))}
            {val.length > 2 && (
              <Text size="xs" c="dimmed">
                +{val.length - 2} lainnya
              </Text>
            )}
          </Stack>
        ) : (
          <Text size="xs" c="dimmed">
            -
          </Text>
        ),
    },
    {
      title: "Unit Kerja",
      dataIndex: "unit_kerja_text",
      key: "unit_kerja_text",
      width: 180,
      ellipsis: true,
      render: (val, record) => (
        <Tooltip label={val || record.unit_kerja}>
          <Text size="xs">{val || record.unit_kerja}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Alokasi",
      dataIndex: "alokasi",
      key: "alokasi",
      width: 70,
      align: "center",
      render: (val) => (
        <Text size="sm" fw={600}>
          {val}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: "Aksi",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => {
        // Non-admin hanya bisa hapus jika status === "menunggu"
        const canDelete = isAdmin || record.status === "menunggu";
        // Non-admin hanya bisa edit jika status !== "disetujui"
        const canEdit = isAdmin || record.status !== "disetujui";

        return (
          <Group gap={4} justify="center">
            {isAdmin && (
              <Tooltip label="Verifikasi">
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  size="sm"
                  onClick={() =>
                    setVerifikasiModal({ open: true, data: record })
                  }
                >
                  <IconCheck size={14} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label="Edit">
              <ActionIcon
                variant="subtle"
                color="green"
                size="sm"
                onClick={() => setModal({ open: true, data: record })}
                disabled={!canEdit}
              >
                <IconEdit size={14} />
              </ActionIcon>
            </Tooltip>
            <Popconfirm
              title="Hapus usulan?"
              onConfirm={() => hapusUsulan(record.usulan_id)}
              okText="Ya"
              cancelText="Tidak"
              disabled={!canDelete}
            >
              <Tooltip
                label={
                  canDelete
                    ? "Hapus"
                    : "Tidak bisa hapus (status bukan menunggu)"
                }
              >
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  disabled={!canDelete}
                  loading={isDeleting}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </Popconfirm>
          </Group>
        );
      },
    },
  ];

  // Download Excel handler
  const [downloading, setDownloading] = useState(false);

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      message.loading({ content: "Mengunduh data...", key: "download" });

      // Fetch all data with limit=-1
      const allData = await getUsulan({
        ...filters,
        limit: -1,
      });

      if (!allData?.data?.length) {
        message.warning({
          content: "Tidak ada data untuk diunduh",
          key: "download",
        });
        return;
      }

      // Transform data for Excel
      const excelData = allData.data.map((item, index) => ({
        No: index + 1,
        "Jenis Jabatan": item.jenis_jabatan || "-",
        "Nama Jabatan": item.nama_jabatan || item.jabatan_id || "-",
        "Kualifikasi Pendidikan":
          item.kualifikasi_pendidikan_detail
            ?.map((p) => `${p.tk_pend} - ${p.label}`)
            .join("; ") || "-",
        "Unit Kerja": item.unit_kerja_text || item.unit_kerja || "-",
        Alokasi: item.alokasi || 0,
        Status: item.status || "-",
        "Dibuat Oleh": item.dibuatOleh?.username || "-",
        "Dibuat Pada": item.dibuat_pada
          ? dayjs(item.dibuat_pada).format("DD/MM/YYYY HH:mm")
          : "-",
      }));

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Usulan Formasi");

      // Auto-width columns
      const colWidths = Object.keys(excelData[0] || {}).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      ws["!cols"] = colWidths;

      // Generate buffer
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `usulan_formasi_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
      message.success({ content: "Data berhasil diunduh", key: "download" });
    } catch (error) {
      console.error(error);
      message.error({ content: "Gagal mengunduh data", key: "download" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Stack gap="xs">
      {/* Header: Stats */}
      <Paper p="xs" radius="sm" withBorder>
        <Group gap="lg">
          <Group gap={4}>
            <Text size="xs" c="dimmed">
              Usulan:
            </Text>
            <Text size="sm" fw={600}>
              {total}
            </Text>
          </Group>
          <Group gap={4}>
            <Text size="xs" c="dimmed">
              Alokasi:
            </Text>
            <Text size="sm" fw={600} c="blue">
              {totalAlokasi}
            </Text>
          </Group>
          <Group gap={4}>
            <Text size="xs" c="dimmed">
              Disetujui:
            </Text>
            <Text size="sm" fw={600} c="green">
              {disetujui}
            </Text>
          </Group>
          <Group gap={4}>
            <Text size="xs" c="dimmed">
              Menunggu:
            </Text>
            <Text size="sm" fw={600} c="orange">
              {menunggu}
            </Text>
          </Group>
        </Group>
      </Paper>

      {/* Filter Row (Full Width) */}
      <Paper p="xs" radius="sm" withBorder>
        <Group gap="xs" wrap="wrap">
          <Input
            placeholder="Cari jabatan..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ width: 180 }}
            size="small"
            allowClear
          />
          <Select
            placeholder="Jenis Jabatan"
            value={urlJenis || undefined}
            onChange={(val) => updateFilters({ jenis: val || "", page: 1 })}
            style={{ width: 130 }}
            size="small"
            allowClear
          >
            <Select.Option value="pelaksana">Pelaksana</Select.Option>
            <Select.Option value="fungsional">Fungsional</Select.Option>
          </Select>
          <Select
            placeholder="Status"
            value={urlStatus || undefined}
            onChange={(val) => updateFilters({ status: val || "", page: 1 })}
            style={{ width: 120 }}
            size="small"
            allowClear
          >
            <Select.Option value="menunggu">Menunggu</Select.Option>
            <Select.Option value="disetujui">Disetujui</Select.Option>
            <Select.Option value="ditolak">Ditolak</Select.Option>
            <Select.Option value="perbaikan">Perbaikan</Select.Option>
          </Select>
          <TreeSelect
            placeholder="Unit Kerja"
            value={urlUnitKerja || undefined}
            onChange={(val) =>
              updateFilters({ "unit-kerja": val || "", page: 1 })
            }
            treeData={opdTree}
            showSearch
            treeNodeFilterProp="label"
            allowClear
            loading={loadingOpd}
            style={{ width: 250 }}
            size="small"
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          />
          <div style={{ flex: 1 }} />
          <Tooltip label="Refresh">
            <Button
              icon={<IconRefresh size={14} />}
              onClick={() => refetch()}
              size="small"
            />
          </Tooltip>
          <Button
            icon={<IconDownload size={14} />}
            size="small"
            loading={downloading}
            onClick={handleDownloadExcel}
          >
            Unduh
          </Button>
          <Button
            type="primary"
            icon={<IconPlus size={14} />}
            onClick={() => setModal({ open: true, data: null })}
            size="small"
          >
            Buat Usulan
          </Button>
        </Group>
      </Paper>

      {/* Table */}
      <Paper p="xs" radius="sm" withBorder>
        <Table
          dataSource={data?.data || []}
          columns={columns}
          rowKey="usulan_id"
          size="small"
          loading={isLoading}
          pagination={{
            current: Number(urlPage),
            pageSize: Number(urlLimit),
            total: data?.meta?.total || 0,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total}`,
            onChange: (p, l) => updateFilters({ page: p, limit: l }),
          }}
          scroll={{ x: 1000 }}
        />
      </Paper>

      {/* Modals */}
      <UsulanModal
        open={modal.open}
        onClose={() => setModal({ open: false, data: null })}
        data={modal.data}
        formasiId={formasiId}
      />
      <VerifikasiModal
        open={verifikasiModal.open}
        onClose={() => setVerifikasiModal({ open: false, data: null })}
        data={verifikasiModal.data}
      />
    </Stack>
  );
}

export default UsulanList;
