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
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  ActionIcon,
  Box,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBriefcase,
  IconBuilding,
  IconDownload,
  IconEdit,
  IconFileText,
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
  Input,
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
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";


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
      `\\b${input.replace(/[.*+?^${}()[|\\]/g, '\\$&')}\\b`,
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

function UsulanList({ formasiId, formasiUsulanId, submissionStatus }) {
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

  // Fetch usulan
  const { data, isLoading, refetch } = useQuery(
    ["perencanaan-usulan", filters],
    () => getUsulan(filters),
    { keepPreviousData: true, enabled: !!formasiUsulanId }
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

  // Stats - simplified
  const total = data?.meta?.total || data?.rekap?.total || 0;
  const totalAlokasi = data?.rekap?.total_alokasi || 0; // Only verified
  const totalAlokasiSemua = data?.rekap?.total_alokasi_semua || totalAlokasi;
  const totalDisetujui = data?.rekap?.total_disetujui || 0;

  // Determine if editable based on submission status
  // Non-admin can only edit when status is draft or perbaikan
  // When status is disetujui, ditolak, or menunggu, non-admin cannot edit
  const isEditable = isAdmin || (submissionStatus === "draft" || submissionStatus === "perbaikan");

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
            <Text size="xs" c="dimmed">Jumlah Usulan:</Text>
            <Text size="sm" fw={600}>{total}</Text>
            {totalDisetujui > 0 && (
              <Tag color="green" size="small">{totalDisetujui} terverifikasi</Tag>
            )}
          </Group>
          <Text size="xs" c="dimmed">|</Text>
          <Group gap={4}>
            <Text size="xs" c="dimmed">Total Alokasi (Terverifikasi):</Text>
            <Text size="sm" fw={600} c="green">{totalAlokasi}</Text>
            {totalAlokasiSemua !== totalAlokasi && (
              <Text size="xs" c="dimmed">/ {totalAlokasiSemua} total</Text>
            )}
          </Group>
          {!isEditable && (
            <>
              <Text size="xs" c="dimmed">|</Text>
              <Tag color="orange">Pengajuan Terkunci - Tidak dapat diubah</Tag>
            </>
          )}
        </Group>
      </Paper>

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
            placeholder={isLoadingJabatan ? "Memuat jabatan..." : "Filter Jabatan"}
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
            title={
              !isEditable
                ? "Tidak dapat menambah data"
                : "Tambah Jabatan"
            }
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
              const hasVerifier = record.diverifikasiOleh || record.diverifikasi_pada;

              if (!hasCatatan && !hasAlasanPerbaikan && !hasVerifier) return null;

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
                            {record.diverifikasiOleh.username || record.diverifikasiOleh.custom_id || "-"}
                          </Text>
                        </Group>
                      )}
                      {record.diverifikasi_pada && (
                        <Group gap={4}>
                          <Text size="xs" c="dimmed">
                            Tanggal verifikasi:
                          </Text>
                          <Text size="xs" fw={500}>
                            {dayjs(record.diverifikasi_pada).format("DD/MM/YYYY HH:mm")}
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
                    defaultActiveKey={["verifikasi", "alasan_perbaikan", "catatan"]}
                    size="small"
                    bordered={false}
                    style={{ background: "transparent" }}
                  />
                </Box>
              );
            },
            rowExpandable: (record) =>
              record.status !== "menunggu" &&
              (record.catatan || record.alasan_perbaikan || record.diverifikasiOleh || record.diverifikasi_pada),
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
    </Stack>
  );
}

export default UsulanList;