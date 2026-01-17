import {
  deleteLampiran,
  downloadLampiran,
  getLampiran,
  updateLampiran,
  uploadLampiran,
} from "@/services/perencanaan-formasi.services";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  ActionIcon,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import {
  IconDownload,
  IconEdit,
  IconEye,
  IconFile,
  IconFileText,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Table,
  Tag,
  Tooltip,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

// Format file size
const formatFileSize = (bytes) => {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Strip file extension from name
const stripExtension = (filename) => {
  if (!filename) return "-";
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return filename;
  return filename.substring(0, lastDotIndex);
};

// Get file type tag
const FileTypeTag = ({ type }) => {
  const typeMap = {
    "application/pdf": { color: "red", label: ".pdf" },
    "image/jpeg": { color: "blue", label: ".jpg" },
    "image/png": { color: "cyan", label: ".png" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { color: "green", label: ".xlsx" },
    "application/vnd.ms-excel": { color: "green", label: ".xls" },
    "application/msword": { color: "blue", label: ".doc" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { color: "blue", label: ".docx" },
  };
  const config = typeMap[type] || { color: "default", label: type?.split("/")[1] || "file" };
  return <Tag color={config.color}>{config.label}</Tag>;
};

// Modal Upload Lampiran
const UploadModal = ({ open, onClose, formasiId }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { mutate: upload, isLoading } = useMutation(
    (formData) => uploadLampiran(formData),
    {
      onSuccess: () => {
        message.success("File berhasil diupload");
        queryClient.invalidateQueries(["perencanaan-lampiran"]);
        form.resetFields();
        setFile(null);
        onClose();
      },
      onError: (error) => {
        message.error(error?.response?.data?.message || "Gagal mengupload file");
      },
    }
  );

  const handleSubmit = (values) => {
    if (!file) {
      message.warning("Pilih file terlebih dahulu");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    // Jika ada nama dokumen custom, gunakan itu + extension dari file asli
    if (values.nama_dokumen) {
      const ext = file.name.split(".").pop();
      formData.append("file_name", `${values.nama_dokumen}.${ext}`);
    }
    if (values.unit_kerja) formData.append("unit_kerja", values.unit_kerja);
    // Kirim formasi_id untuk validasi di backend
    if (formasiId) formData.append("formasi_id", formasiId);
    upload(formData);
  };

  const handleClose = () => {
    form.resetFields();
    setFile(null);
    onClose();
  };

  return (
    <Modal
      title={
        <Group gap="xs">
          <IconUpload size={18} />
          <span>Lampiran Baru</span>
        </Group>
      }
      open={open}
      onCancel={handleClose}
      width={isMobile ? "95%" : 500}
      destroyOnClose
      centered={isMobile}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={handleClose} style={{ marginRight: 8 }}>
            Batal
          </Button>
          <Button type="primary" loading={isLoading} onClick={() => form.submit()}>
            Simpan
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="nama_dokumen"
          label={
            <Group gap={4}>
              <IconFileText size={14} />
              <span>Nama Dokumen</span>
            </Group>
          }
        >
          <Input placeholder="Contoh: kppi_2026" prefix={<IconFile size={14} color="#868e96" />} />
        </Form.Item>

        <Form.Item
          label={
            <Group gap={4}>
              <IconUpload size={14} />
              <span>Upload Dokumen Lampiran</span>
            </Group>
          }
          required
        >
          <Upload.Dragger
            maxCount={1}
            beforeUpload={(f) => {
              const allowedTypes = [
                "application/pdf",
                "image/jpeg",
                "image/png",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              ];
              if (!allowedTypes.includes(f.type)) {
                message.error("Tipe file tidak diizinkan");
                return Upload.LIST_IGNORE;
              }
              if (f.size > 10 * 1024 * 1024) {
                message.error("Ukuran file maksimal 10MB");
                return Upload.LIST_IGNORE;
              }
              setFile(f);
              return false;
            }}
            onRemove={() => setFile(null)}
            fileList={file ? [file] : []}
          >
            <p className="ant-upload-drag-icon">
              <IconUpload size={36} color="#868e96" />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 13 }}>
              Drag and drop your files here
            </p>
            <p className="ant-upload-hint" style={{ fontSize: 11 }}>
              Format: PDF, JPG, PNG, Excel, Word. Maksimal 10MB
            </p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Modal Edit Lampiran (with file re-upload support)
const EditModal = ({ open, onClose, data }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [currentExt, setCurrentExt] = useState("");
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Set current extension when data changes
  useEffect(() => {
    if (data?.file_name) {
      const ext = data.file_name.split(".").pop();
      setCurrentExt(ext);
    }
  }, [data]);

  const { mutate: update, isLoading } = useMutation(
    (formData) => updateLampiran(data?.lampiran_id, formData),
    {
      onSuccess: () => {
        message.success("Lampiran berhasil diperbarui");
        queryClient.invalidateQueries(["perencanaan-lampiran"]);
        form.resetFields();
        setFile(null);
        onClose();
      },
      onError: (error) => {
        message.error(error?.response?.data?.message || "Gagal memperbarui lampiran");
      },
    }
  );

  const handleSubmit = (values) => {
    // Determine extension: from new file or current file
    const ext = file ? file.name.split(".").pop() : currentExt;
    const fullFileName = values.file_name ? `${values.file_name}.${ext}` : null;

    // Always use FormData because the route uses multer middleware
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    if (fullFileName) {
      formData.append("file_name", fullFileName);
    }
    update(formData);
  };

  const handleClose = () => {
    form.resetFields();
    setFile(null);
    onClose();
  };

  if (!data) return null;

  return (
    <Modal
      title={
        <Group gap="xs">
          <IconEdit size={18} />
          <span>Edit Lampiran</span>
        </Group>
      }
      open={open}
      onCancel={handleClose}
      width={isMobile ? "95%" : 550}
      destroyOnClose
      centered={isMobile}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={handleClose} style={{ marginRight: 8 }}>
            Batal
          </Button>
          <Button type="primary" loading={isLoading} onClick={() => form.submit()}>
            Simpan
          </Button>
        </div>
      }
    >
      {/* Current File Info */}
      <Paper p="xs" radius="sm" withBorder mb="md" bg="gray.0">
        <Stack gap={4}>
          <Group gap="xs">
            <Text size="xs" c="dimmed" w={100}>File Saat Ini:</Text>
            <Group gap={4}>
              <IconFile size={14} color="#868e96" />
              <Text size="sm" fw={500}>{data.file_name}</Text>
            </Group>
          </Group>
          <Group gap="xs">
            <Text size="xs" c="dimmed" w={100}>Ukuran:</Text>
            <Text size="sm">{formatFileSize(data.file_size)}</Text>
          </Group>
          <Group gap="xs">
            <Text size="xs" c="dimmed" w={100}>Tipe:</Text>
            <FileTypeTag type={data.file_type} />
          </Group>
          {data.file_url && (
            <Group gap="xs">
              <Text size="xs" c="dimmed" w={100}>URL:</Text>
              <a href={data.file_url} target="_blank" rel="noopener noreferrer">
                <Text size="xs" c="blue">Buka file</Text>
              </a>
            </Group>
          )}
        </Stack>
      </Paper>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ file_name: stripExtension(data.file_name) }}
      >
        <Form.Item
          name="file_name"
          label={
            <Group gap={4}>
              <IconFile size={14} />
              <span>Nama File (tanpa extension)</span>
            </Group>
          }
        >
          <Input
            placeholder="Nama file"
            prefix={<IconFile size={14} color="#868e96" />}
            suffix={<Text size="xs" c="dimmed">.{currentExt || file?.name?.split(".").pop()}</Text>}
          />
        </Form.Item>

        <Form.Item
          label={
            <Group gap={4}>
              <IconUpload size={14} />
              <span>Upload File Baru (Opsional)</span>
            </Group>
          }
          extra="Biarkan kosong jika tidak ingin mengganti file"
        >
          <Upload.Dragger
            maxCount={1}
            beforeUpload={(f) => {
              const allowedTypes = [
                "application/pdf",
                "image/jpeg",
                "image/png",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              ];
              if (!allowedTypes.includes(f.type)) {
                message.error("Tipe file tidak diizinkan");
                return Upload.LIST_IGNORE;
              }
              if (f.size > 10 * 1024 * 1024) {
                message.error("Ukuran file maksimal 10MB");
                return Upload.LIST_IGNORE;
              }
              setFile(f);
              // Update extension from new file
              setCurrentExt(f.name.split(".").pop());
              return false;
            }}
            onRemove={() => {
              setFile(null);
              // Restore original extension
              setCurrentExt(data.file_name.split(".").pop());
            }}
            fileList={file ? [file] : []}
          >
            <p className="ant-upload-drag-icon">
              <IconUpload size={32} color="#868e96" />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 12 }}>
              Drag and drop untuk mengganti file
            </p>
            <p className="ant-upload-hint" style={{ fontSize: 11 }}>
              Format: PDF, JPG, PNG, Excel, Word. Maksimal 10MB
            </p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
};

function LampiranList({ formasiId, formasiUsulanId, formasi, submissionStatus }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploadModal, setUploadModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, data: null });
  const [downloading, setDownloading] = useState(null);

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Determine if editable based on submission status
  const isEditable = !submissionStatus || submissionStatus === "draft" || submissionStatus === "perbaikan";

  // Get filters from URL
  const { lPage = 1, lLimit = 10, lSearch = "" } = router.query;

  // Local state for search input (for debounce)
  const [searchInput, setSearchInput] = useState(lSearch);
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== lSearch) {
      updateFilters({ lSearch: debouncedSearch, lPage: 1 });
    }
  }, [debouncedSearch]);

  // Sync URL search to local state on mount
  useEffect(() => {
    setSearchInput(lSearch);
  }, [lSearch]);

  // Update URL params
  const updateFilters = useCallback(
    (newFilters) => {
      const query = { ...router.query, ...newFilters };
      Object.keys(query).forEach((key) => {
        if (!query[key] || query[key] === "") delete query[key];
      });
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    },
    [router]
  );

  // Filters object for query
  const filters = { page: Number(lPage), limit: Number(lLimit), search: lSearch };

  // Fetch lampiran
  const { data, isLoading, refetch } = useQuery(
    ["perencanaan-lampiran", filters],
    () => getLampiran(filters),
    { keepPreviousData: true }
  );

  // Delete mutation
  const { mutate: hapusLampiran, isLoading: isDeleting } = useMutation(
    (id) => deleteLampiran(id),
    {
      onSuccess: () => {
        message.success("Lampiran berhasil dihapus");
        queryClient.invalidateQueries(["perencanaan-lampiran"]);
      },
      onError: (error) => {
        message.error(error?.response?.data?.message || "Gagal menghapus lampiran");
      },
    }
  );

  // Download handler
  const handleDownload = async (record) => {
    try {
      setDownloading(record.lampiran_id);
      message.loading({ content: "Mengunduh file...", key: "download" });
      const response = await downloadLampiran(record.lampiran_id);
      const blob = new Blob([response.data], { type: record.file_type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = record.file_name;
      link.click();
      window.URL.revokeObjectURL(url);
      message.success({ content: "File berhasil diunduh", key: "download" });
    } catch (error) {
      message.error({ content: "Gagal mengunduh file", key: "download" });
    } finally {
      setDownloading(null);
    }
  };

  const columns = [
    {
      title: "No",
      key: "no",
      width: 50,
      render: (_, __, index) => (filters.page - 1) * filters.limit + index + 1,
    },
    {
      title: "Nama File",
      dataIndex: "file_name",
      key: "file_name",
      ellipsis: true,
      render: (val) => (
        <Tooltip title={val}>
          <Group gap={6}>
            <IconFile size={14} color="#868e96" />
            <Text size="sm">{stripExtension(val)}</Text>
          </Group>
        </Tooltip>
      ),
    },
    {
      title: "Ukuran",
      dataIndex: "file_size",
      key: "file_size",
      width: 90,
      render: (val) => <Text size="xs" c="dimmed">{formatFileSize(val)}</Text>,
    },
    {
      title: "URL",
      dataIndex: "file_url",
      key: "file_url",
      width: 70,
      align: "center",
      render: (val) =>
        val ? (
          <Tooltip title="Buka URL">
            <ActionIcon
              variant="subtle"
              color="blue"
              size="sm"
              onClick={() => window.open(val, "_blank")}
            >
              <IconEye size={14} />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Text size="xs" c="dimmed">-</Text>
        ),
    },
    {
      title: "Tipe",
      dataIndex: "file_type",
      key: "file_type",
      width: 80,
      render: (val) => <FileTypeTag type={val} />,
    },
    {
      title: "Upload By",
      dataIndex: "dibuatOleh",
      key: "dibuatOleh",
      width: 130,
      render: (val) => <Text size="xs" c="dimmed">{val?.username || "-"}</Text>,
    },
    {
      title: "Upload at",
      dataIndex: "dibuat_pada",
      key: "dibuat_pada",
      width: 130,
      render: (val) => <Text size="xs" c="dimmed">{dayjs(val).format("DD-MM-YYYY HH:mm")}</Text>,
    },
    {
      title: "Aksi",
      key: "action",
      width: 110,
      align: "center",
      render: (_, record) => (
        <Group gap={4} justify="center">
          {isEditable && (
            <Tooltip title="Edit">
              <ActionIcon
                variant="subtle"
                color="blue"
                size="sm"
                onClick={() => setEditModal({ open: true, data: record })}
              >
                <IconEdit size={14} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip title="Download">
            <ActionIcon
              variant="subtle"
              color="green"
              size="sm"
              onClick={() => handleDownload(record)}
              loading={downloading === record.lampiran_id}
            >
              <IconDownload size={14} />
            </ActionIcon>
          </Tooltip>
          {isEditable && (
            <Popconfirm
              title="Hapus lampiran?"
              onConfirm={() => hapusLampiran(record.lampiran_id)}
              okText="Ya"
              cancelText="Tidak"
            >
              <Tooltip title="Hapus">
                <ActionIcon variant="subtle" color="red" size="sm" loading={isDeleting}>
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </Popconfirm>
          )}
        </Group>
      ),
    },
  ];

  // Stats
  const total = data?.meta?.total || 0;

  // Download Excel handler
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);
      message.loading({ content: "Mengunduh data...", key: "download-excel" });

      // Fetch all data with limit=-1
      const allData = await getLampiran({ ...filters, limit: -1 });

      if (!allData?.data?.length) {
        message.warning({ content: "Tidak ada data untuk diunduh", key: "download-excel" });
        return;
      }

      // Transform data for Excel
      const excelData = allData.data.map((item, index) => ({
        No: index + 1,
        "Nama File": item.file_name || "-",
        "Ukuran": formatFileSize(item.file_size),
        "Tipe": item.file_type?.split("/")[1] || "-",
        "URL": item.file_url || "-",
        "Upload By": item.dibuatOleh?.username || "-",
        "Upload At": item.dibuat_pada ? dayjs(item.dibuat_pada).format("DD/MM/YYYY HH:mm") : "-",
      }));

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Lampiran");

      // Generate buffer
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `lampiran_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
      message.success({ content: "Data berhasil diunduh", key: "download-excel" });
    } catch (error) {
      console.error(error);
      message.error({ content: "Gagal mengunduh data", key: "download-excel" });
    } finally {
      setDownloadingExcel(false);
    }
  };

  return (
    <Stack gap="xs">
      {/* Header: Stats */}
      <Paper p="xs" radius="sm" withBorder>
        <Group gap="lg">
          <Group gap={4}>
            <Text size="xs" c="dimmed">Total File:</Text>
            <Text size="sm" fw={600}>{total}</Text>
          </Group>
        </Group>
      </Paper>

      {/* Filter Row */}
      <Paper p="xs" radius="sm" withBorder>
        <Group gap="xs" wrap="wrap" justify="space-between">
          <Group gap="xs" wrap="wrap" style={{ flex: 1 }}>
            <Input
              placeholder="Cari file..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: isMobile ? "100%" : 200, flex: isMobile ? 1 : undefined }}
              size="small"
              allowClear
            />
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Tooltip title="Refresh">
              <Button icon={<IconRefresh size={14} />} onClick={() => refetch()} size="small" />
            </Tooltip>
            <Button
              icon={<IconDownload size={14} />}
              size="small"
              loading={downloadingExcel}
              onClick={handleDownloadExcel}
            >
              {isMobile ? null : "Unduh"}
            </Button>
            {isEditable && (
              <Tooltip
                title={
                  formasi?.status !== "aktif"
                    ? "Formasi tidak aktif"
                    : "Tambah lampiran baru"
                }
              >
                <Button
                  type="primary"
                  icon={<IconPlus size={14} />}
                  onClick={() => setUploadModal(true)}
                  size="small"
                  disabled={formasi?.status !== "aktif"}
                >
                  {isMobile ? "Tambah" : "Tambah Lampiran"}
                </Button>
              </Tooltip>
            )}
          </Group>
        </Group>
      </Paper>

      {/* Table */}
      <Paper p="xs" radius="sm" withBorder>
        <Table
          dataSource={data?.data || []}
          columns={columns}
          rowKey="lampiran_id"
          size="small"
          loading={isLoading}
          pagination={{
            current: Number(lPage),
            pageSize: Number(lLimit),
            total: data?.meta?.total || 0,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total}`,
            onChange: (p, l) => updateFilters({ lPage: p, lLimit: l }),
          }}
          scroll={{ x: isMobile ? 700 : 900 }}
        />
      </Paper>

      {/* Modals */}
      <UploadModal open={uploadModal} onClose={() => setUploadModal(false)} formasiId={formasiId} />
      <EditModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, data: null })}
        data={editModal.data}
      />
    </Stack>
  );
}

export default LampiranList;
