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
} from "@/services/perencanaan-formasi.services";
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBriefcase,
  IconBuilding,
  IconCircleMinus,
  IconCirclePlus,
  IconDownload,
  IconEdit,
  IconEye,
  IconFileText,
  IconGitCompare,
  IconHash,
  IconMessage,
  IconPaperclip,
  IconPlus,
  IconRefresh,
  IconSchool,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Collapse,
  Form,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag,
  Tooltip,
  TreeSelect,
} from "antd";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";

// Modal Create/Edit Usulan
const UsulanModal = ({ open, onClose, data, formasiId, formasiUsulanId }) => {
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

  // Fetch Lampiran untuk formasi ini (using formasiId for backward compatibility or parent context)
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
      `\\b${input.replace(/[.*+?^${}()[|\\]/g, "\\$&")}\\b`,
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
        : createUsulan({ ...values, formasi_usulan_id: formasiUsulanId }), // Use formasiUsulanId
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

// Modal Perbandingan Data Usulan
const ComparisonModal = ({ open, onClose, snapshotData, currentData, comparisonStats }) => {
  if (!snapshotData || !comparisonStats) return null;

  const { added, removed, unchanged } = comparisonStats;

  // Render compact item row - single line
  const renderItem = (item, status) => {
    const statusConfig = {
      added: { color: "green", bg: "#e6ffed", label: "Baru", icon: IconCirclePlus },
      removed: { color: "red", bg: "#ffebe9", label: "Dihapus", icon: IconCircleMinus },
      unchanged: { color: "gray", bg: "#f8f9fa", label: "Tetap", icon: null },
    };
    const config = statusConfig[status];
    const Icon = config.icon;

    // Get pendidikan details - show tk_pend short, full label in tooltip
    const pendidikanDetails = item.kualifikasi_pendidikan_detail || [];
    const pendidikanShort = pendidikanDetails.length > 0
      ? pendidikanDetails.map(p => p.tk_pend).join(", ")
      : "-";
    const pendidikanFull = pendidikanDetails.length > 0
      ? pendidikanDetails.map(p => p.label).join("\n")
      : "-";

    const unitKerja = item.unit_kerja_text || item.unit_kerja || "-";
    // Truncate unit kerja if too long
    const unitKerjaShort = unitKerja.length > 40 ? unitKerja.substring(0, 40) + "..." : unitKerja;

    return (
      <tr key={item.usulan_id} style={{ backgroundColor: config.bg }}>
        <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>
          <Badge size="xs" color={item.jenis_jabatan === "fungsional" ? "blue" : "green"}>
            {item.jenis_jabatan === "fungsional" ? "JFT" : "JFU"}
          </Badge>
        </td>
        <td style={{ padding: "6px 8px" }}>
          <Text size="xs" fw={500} lineClamp={1}>
            {item.nama_jabatan || item.jabatan_id}
          </Text>
        </td>
        <td style={{ padding: "6px 8px" }}>
          <Tooltip title={unitKerja}>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {unitKerjaShort}
            </Text>
          </Tooltip>
        </td>
        <td style={{ padding: "6px 8px", textAlign: "center" }}>
          <Text size="xs" fw={600}>{item.alokasi}</Text>
        </td>
        <td style={{ padding: "6px 8px" }}>
          <Tooltip title={pendidikanFull} overlayStyle={{ whiteSpace: "pre-line", maxWidth: 400 }}>
            <Text size="xs" c="dimmed" style={{ cursor: pendidikanDetails.length > 0 ? "help" : "default" }}>
              {pendidikanShort}
            </Text>
          </Tooltip>
        </td>
        <td style={{ padding: "6px 8px", textAlign: "center" }}>
          <Badge size="xs" color={config.color} variant="light" leftSection={Icon && <Icon size={10} />}>
            {config.label}
          </Badge>
        </td>
      </tr>
    );
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
  };

  const thStyle = {
    padding: "8px",
    textAlign: "left",
    borderBottom: "1px solid #dee2e6",
    fontWeight: 600,
    fontSize: "11px",
    color: "#868e96",
    backgroundColor: "#f8f9fa",
  };

  return (
    <Modal
      title={
        <Group gap="xs">
          <IconGitCompare size={18} />
          <span>Detail Perbandingan Data Usulan</span>
        </Group>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={950}
    >
      <Stack gap="sm">
        {/* Summary */}
        <Paper p="xs" radius="sm" withBorder bg="blue.0">
          <Group gap="lg" wrap="wrap">
            <Group gap="xs">
              <Text size="xs" c="dimmed">Data Asli:</Text>
              <Text size="xs" fw={600}>{snapshotData.length} usulan</Text>
              <Text size="xs" c="dimmed">|</Text>
              <Text size="xs" fw={600}>
                {snapshotData.reduce((acc, item) => acc + (item.alokasi || 0), 0)} alokasi
              </Text>
            </Group>
            <Group gap="xs">
              <Text size="xs" c="dimmed">Saat Ini:</Text>
              <Text size="xs" fw={600}>{currentData?.length || 0} usulan</Text>
              <Text size="xs" c="dimmed">|</Text>
              <Text size="xs" fw={600}>
                {(currentData || []).reduce((acc, item) => acc + (item.alokasi || 0), 0)} alokasi
              </Text>
            </Group>
            {(added.length > 0 || removed.length > 0) && (
              <Group gap="xs">
                {added.length > 0 && (
                  <Badge size="xs" color="green" variant="light">+{added.length} baru</Badge>
                )}
                {removed.length > 0 && (
                  <Badge size="xs" color="red" variant="light">-{removed.length} dihapus</Badge>
                )}
              </Group>
            )}
          </Group>
        </Paper>

        <ScrollArea h={400} offsetScrollbars>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 60 }}>Jenis</th>
                <th style={{ ...thStyle, width: 200 }}>Nama Jabatan</th>
                <th style={{ ...thStyle, width: 250 }}>Unit Kerja</th>
                <th style={{ ...thStyle, width: 60, textAlign: "center" }}>Alokasi</th>
                <th style={{ ...thStyle, width: 120 }}>Pendidikan</th>
                <th style={{ ...thStyle, width: 80, textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Removed Items */}
              {removed.length > 0 && removed.map((item) => renderItem(item, "removed"))}
              {/* Added Items */}
              {added.length > 0 && added.map((item) => renderItem(item, "added"))}
              {/* Unchanged Items */}
              {unchanged.length > 0 && unchanged.map((item) => renderItem(item, "unchanged"))}
            </tbody>
          </table>

          {/* No changes message */}
          {added.length === 0 && removed.length === 0 && unchanged.length > 0 && (
            <Paper p="xs" radius="sm" withBorder bg="gray.0" mt="sm">
              <Text size="xs" c="dimmed" ta="center">
                Tidak ada perubahan. Data saat ini sama dengan data saat pengajuan dikirim.
              </Text>
            </Paper>
          )}
        </ScrollArea>
      </Stack>
    </Modal>
  );
};

function UsulanList({ formasiId, formasiUsulanId, submissionStatus, submissionData }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.current_role === "admin";
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);

  // Get filters from URL (using kebab-case for cleaner URLs)
  const {
    page: urlPage = 1,
    limit: urlLimit = 10,
    status: urlStatus = "",
    jenis: urlJenis = "",
    jabatan: urlJabatan = "",
    "unit-kerja": urlUnitKerja = "",
  } = router.query;

  // Fetch Unit Kerja (OPD) Tree for filter
  const { data: opdTree, isLoading: loadingOpd } = useQuery({
    queryKey: ["unor-fasilitator"],
    queryFn: getOpdFasilitator,
    staleTime: 1000 * 60 * 10,
  });

  // Fetch Jabatan Fungsional for filter
  const { data: jabatanFungsional, isLoading: loadingJFT } = useQuery({
    queryKey: ["ref-jabatan-fungsional"],
    queryFn: getJabatanFungsional,
    enabled: !urlJenis || urlJenis === "fungsional",
    staleTime: 1000 * 60 * 10,
  });

  // Fetch Jabatan Pelaksana for filter
  const { data: jabatanPelaksana, isLoading: loadingJFU } = useQuery({
    queryKey: ["ref-jabatan-pelaksana"],
    queryFn: getJabatanPelaksana,
    enabled: !urlJenis || urlJenis === "pelaksana",
    staleTime: 1000 * 60 * 10,
  });

  // Combine jabatan data based on jenis filter
  const getJabatanTreeData = () => {
    if (urlJenis === "fungsional") return jabatanFungsional || [];
    if (urlJenis === "pelaksana") return jabatanPelaksana || [];
    // If no jenis filter, combine both with grouping
    const combined = [];
    if (jabatanFungsional?.length) {
      combined.push({
        value: "group-fungsional",
        title: "Jabatan Fungsional",
        selectable: false,
        children: jabatanFungsional,
      });
    }
    if (jabatanPelaksana?.length) {
      combined.push({
        value: "group-pelaksana",
        title: "Jabatan Pelaksana",
        selectable: false,
        children: jabatanPelaksana,
      });
    }
    return combined;
  };

  const jabatanTreeData = getJabatanTreeData();
  const isLoadingJabatan = loadingJFT || loadingJFU;

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
    formasi_usulan_id: formasiUsulanId,
    status: urlStatus,
    jenis_jabatan: urlJenis,
    jabatan_id: urlJabatan,
    unit_kerja: urlUnitKerja,
  };

  const [modal, setModal] = useState({ open: false, data: null });
  const [comparisonModal, setComparisonModal] = useState(false);

  // Fetch usulan
  const { data, isLoading, refetch } = useQuery(
    ["perencanaan-usulan", filters],
    () => getUsulan(filters),
    { keepPreviousData: true, enabled: !!formasiUsulanId }
  );

  // Delete mutation
  const { mutate: hapusUsulan } = useMutation(
    (id) => deleteUsulan(id),
    {
      onMutate: (id) => {
        setDeletingId(id);
      },
      onSuccess: () => {
        message.success("Usulan berhasil dihapus");
        queryClient.invalidateQueries(["perencanaan-usulan"]);
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal menghapus usulan"
        );
      },
      onSettled: () => {
        setDeletingId(null);
      },
    }
  );

  // Stats - simplified
  const total = data?.meta?.total || data?.rekap?.total || 0;
  const totalAlokasi = data?.rekap?.total_alokasi || 0; // Only verified
  const totalAlokasiSemua = data?.rekap?.total_alokasi_semua || totalAlokasi;
  const totalDisetujui = data?.rekap?.total_disetujui || 0;

  // Determine if editable based on submission status
  // Non-admin can only edit when status is draft or perbaikan
  // When status is disetujui, ditolak, or menunggu, non-admin cannot edit
  const isEditable =
    isAdmin || submissionStatus === "draft" || submissionStatus === "perbaikan";

  // Comparison logic - compare data_usulan (snapshot) with current data
  const dataUsulanSnapshot = submissionData?.data_usulan || [];
  const hasSnapshot = submissionData?.is_confirmed && dataUsulanSnapshot.length > 0;
  const currentUsulanIds = new Set((data?.data || []).map((item) => item.usulan_id));
  const snapshotUsulanIds = new Set(dataUsulanSnapshot.map((item) => item.usulan_id));

  // Calculate comparison stats
  const comparisonStats = hasSnapshot
    ? {
        added: (data?.data || []).filter((item) => !snapshotUsulanIds.has(item.usulan_id)),
        removed: dataUsulanSnapshot.filter((item) => !currentUsulanIds.has(item.usulan_id)),
        unchanged: (data?.data || []).filter((item) => snapshotUsulanIds.has(item.usulan_id)),
      }
    : null;

  const columns = [
    {
      title: "No",
      key: "no",
      width: 50,
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
      render: (val, record) => {
        const isNewItem = hasSnapshot && !snapshotUsulanIds.has(record.usulan_id);
        return (
          <Group gap="xs" wrap="nowrap">
            <Text size="sm" fw={500} style={{ flex: 1 }}>
              {val || record.jabatan_id}
            </Text>
            {isNewItem && (
              <Badge size="xs" color="green" variant="light">
                Baru
              </Badge>
            )}
          </Group>
        );
      },
    },
    {
      title: "Kualifikasi Pendidikan",
      dataIndex: "kualifikasi_pendidikan_detail",
      key: "kualifikasi_pendidikan_detail",
      width: 250,
      render: (val) =>
        val?.length > 0 ? (
          <Stack gap={2}>
            {val.slice(0, 2).map((item, i) => (
              <Tooltip key={i} title={item.label}>
                <Group gap={4} wrap="nowrap">
                  <Tag color="blue" style={{ flexShrink: 0 }}>
                    {item.tk_pend}
                  </Tag>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {item.label}
                  </Text>
                </Group>
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
      width: 250,
      render: (val, record) => (
        <Tooltip title={val || record.unit_kerja}>
          <Text size="xs" lineClamp={2} style={{ whiteSpace: "normal" }}>
            {val || record.unit_kerja}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Alokasi",
      dataIndex: "alokasi",
      key: "alokasi",
      width: 80,
      align: "center",
      render: (val) => (
        <Text size="sm" fw={600} c="blue">
          {val}
        </Text>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) => {
        const canEdit = isEditable;
        const canDelete = isEditable;

        return (
          <Group gap={4} justify="center">
            <Tooltip title={canEdit ? "Edit" : "Tidak dapat diedit"}>
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
              <Tooltip title="Hapus">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  disabled={!canDelete}
                  loading={deletingId === record.usulan_id}
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
        "Diverifikasi Oleh": item.diverifikasiOleh?.username || "-",
        "Tanggal Verifikasi": item.diverifikasi_pada
          ? dayjs(item.diverifikasi_pada).format("DD/MM/YYYY HH:mm")
          : "-",
        "Catatan Verifikasi": item.catatan || "",
        "Alasan Perbaikan": item.alasan_perbaikan || "",
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
        <Group gap="lg" wrap="wrap">
          <Group gap={4}>
            <Text size="xs" c="dimmed">
              Jumlah Usulan:
            </Text>
            <Text size="sm" fw={600}>
              {total}
            </Text>
            {totalDisetujui > 0 && (
              <Tag color="green" size="small">
                {totalDisetujui} terverifikasi
              </Tag>
            )}
          </Group>
          <Text size="xs" c="dimmed">
            |
          </Text>
          <Group gap={4}>
            <Text size="xs" c="dimmed">
              Total Alokasi (Terverifikasi):
            </Text>
            <Text size="sm" fw={600} c="green">
              {totalAlokasi}
            </Text>
            {totalAlokasiSemua !== totalAlokasi && (
              <Text size="xs" c="dimmed">
                / {totalAlokasiSemua} total
              </Text>
            )}
          </Group>
          {!isEditable && (
            <>
              <Text size="xs" c="dimmed">
                |
              </Text>
              <Tag color="orange">Pengajuan Terkunci - Tidak dapat diubah</Tag>
            </>
          )}
        </Group>
      </Paper>

      {/* Comparison Summary - Show when is_confirmed and has snapshot */}
      {hasSnapshot && (
        <Paper p="xs" radius="sm" withBorder bg="gray.0">
          <Group gap="md" wrap="wrap" justify="space-between">
            <Group gap="md" wrap="wrap">
              <Group gap="xs">
                <IconGitCompare size={14} color="#868e96" />
                <Text size="xs" c="dimmed">Data saat dikirim:</Text>
                <Text size="xs" fw={600}>{dataUsulanSnapshot.length} usulan</Text>
                <Text size="xs" c="dimmed">|</Text>
                <Text size="xs" fw={600}>
                  {dataUsulanSnapshot.reduce((acc, item) => acc + (item.alokasi || 0), 0)} alokasi
                </Text>
              </Group>
              {(comparisonStats.added.length > 0 || comparisonStats.removed.length > 0) ? (
                <Group gap="xs">
                  <Text size="xs" c="dimmed">Perubahan:</Text>
                  {comparisonStats.added.length > 0 && (
                    <Badge size="xs" color="green" variant="light" leftSection={<IconCirclePlus size={10} />}>
                      +{comparisonStats.added.length} baru
                    </Badge>
                  )}
                  {comparisonStats.removed.length > 0 && (
                    <Badge size="xs" color="red" variant="light" leftSection={<IconCircleMinus size={10} />}>
                      -{comparisonStats.removed.length} dihapus
                    </Badge>
                  )}
                </Group>
              ) : (
                <Badge size="xs" color="gray" variant="light">Tidak ada perubahan</Badge>
              )}
            </Group>
            <Tooltip title="Lihat detail perbandingan">
              <Button
                size="small"
                type="text"
                icon={<IconEye size={14} />}
                onClick={() => setComparisonModal(true)}
              >
                Detail
              </Button>
            </Tooltip>
          </Group>
        </Paper>
      )}

      {/* Filter Row (Full Width) */}
      <Paper p="xs" radius="sm" withBorder>
        <Group gap="xs" wrap="wrap">
          <Select
            placeholder="Jenis Jabatan"
            value={urlJenis || undefined}
            onChange={(val) => {
              // Reset jabatan filter when jenis changes
              updateFilters({ jenis: val || "", jabatan: "", page: 1 });
            }}
            style={{ width: 130 }}
            size="small"
            allowClear
          >
            <Select.Option value="pelaksana">Pelaksana</Select.Option>
            <Select.Option value="fungsional">Fungsional</Select.Option>
          </Select>
          <TreeSelect
            placeholder={
              isLoadingJabatan ? "Memuat jabatan..." : "Filter Jabatan"
            }
            value={urlJabatan || undefined}
            onChange={(val) => updateFilters({ jabatan: val || "", page: 1 })}
            treeData={jabatanTreeData}
            showSearch
            treeNodeFilterProp="label"
            allowClear
            disabled={isLoadingJabatan}
            style={{ width: 250 }}
            size="small"
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            notFoundContent={isLoadingJabatan ? "Memuat..." : "Tidak ditemukan"}
          />
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
            style={{ width: 220 }}
            size="small"
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          />
          <div style={{ flex: 1 }} />
          <Tooltip title="Refresh">
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
          <Tooltip
            title={!isEditable ? "Tidak dapat menambah data" : "Tambah Jabatan"}
          >
            <Button
              type="primary"
              icon={<IconPlus size={14} />}
              onClick={() => setModal({ open: true, data: null })}
              size="small"
              disabled={!isEditable}
            >
              Tambah
            </Button>
          </Tooltip>
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
          scroll={{ x: 1200 }}
          expandable={{
            expandedRowRender: (record) => {
              // Only show expanded content if status is not "menunggu" and has content to show
              const hasCatatan = record.catatan;
              const hasAlasanPerbaikan = record.alasan_perbaikan;
              const hasVerifier =
                record.diverifikasiOleh || record.diverifikasi_pada;

              if (!hasCatatan && !hasAlasanPerbaikan && !hasVerifier)
                return null;

              const items = [];

              // Add verifier info first
              if (hasVerifier) {
                items.push({
                  key: "verifikasi",
                  label: (
                    <Group gap={6}>
                      <IconUser size={14} color="#40c057" />
                      <Text size="xs" fw={500} c="green">
                        Informasi Verifikasi
                      </Text>
                    </Group>
                  ),
                  children: (
                    <Stack gap={4}>
                      {record.diverifikasiOleh && (
                        <Group gap={4}>
                          <Text size="xs" c="dimmed">
                            Diverifikasi oleh:
                          </Text>
                          <Text size="xs" fw={500}>
                            {record.diverifikasiOleh.username ||
                              record.diverifikasiOleh.custom_id ||
                              "-"}
                          </Text>
                        </Group>
                      )}
                      {record.diverifikasi_pada && (
                        <Group gap={4}>
                          <Text size="xs" c="dimmed">
                            Tanggal verifikasi:
                          </Text>
                          <Text size="xs" fw={500}>
                            {dayjs(record.diverifikasi_pada).format(
                              "DD/MM/YYYY HH:mm"
                            )}
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  ),
                });
              }

              if (hasAlasanPerbaikan) {
                items.push({
                  key: "alasan_perbaikan",
                  label: (
                    <Group gap={6}>
                      <IconAlertCircle size={14} color="#fa5252" />
                      <Text size="xs" fw={500} c="red">
                        Alasan Perbaikan
                      </Text>
                    </Group>
                  ),
                  children: (
                    <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>
                      {record.alasan_perbaikan}
                    </Text>
                  ),
                });
              }

              if (hasCatatan) {
                items.push({
                  key: "catatan",
                  label: (
                    <Group gap={6}>
                      <IconMessage size={14} color="#228be6" />
                      <Text size="xs" fw={500} c="blue">
                        Catatan Verifikasi
                      </Text>
                    </Group>
                  ),
                  children: (
                    <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>
                      {record.catatan}
                    </Text>
                  ),
                });
              }

              return (
                <Box pl="md">
                  <Collapse
                    items={items}
                    defaultActiveKey={[
                      "verifikasi",
                      "alasan_perbaikan",
                      "catatan",
                    ]}
                    size="small"
                    bordered={false}
                    style={{ background: "transparent" }}
                  />
                </Box>
              );
            },
            rowExpandable: (record) =>
              record.status !== "menunggu" &&
              (record.catatan ||
                record.alasan_perbaikan ||
                record.diverifikasiOleh ||
                record.diverifikasi_pada),
          }}
        />
      </Paper>

      {/* Modals */}
      <UsulanModal
        open={modal.open}
        onClose={() => setModal({ open: false, data: null })}
        data={modal.data}
        formasiId={formasiId} // For lampiran context
        formasiUsulanId={formasiUsulanId} // For create logic
      />
      <ComparisonModal
        open={comparisonModal}
        onClose={() => setComparisonModal(false)}
        snapshotData={dataUsulanSnapshot}
        currentData={data?.data || []}
        comparisonStats={comparisonStats}
      />
    </Stack>
  );
}

export default UsulanList;
