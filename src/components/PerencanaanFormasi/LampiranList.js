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
  IconDownload,
  IconEdit,
  IconEye,
  IconFile,
  IconFileText,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconUpload,
  IconPaperclip
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
  Card,
  Row,
  Col,
  Typography,
  Space,
  Grid
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();
  const isXs = !screens?.sm;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconUpload size={18} />
          <span>Lampiran Baru</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      width={isXs ? "95%" : 500}
      destroyOnClose
      centered={isXs}
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
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <IconFileText size={14} />
              <span>Nama Dokumen</span>
            </div>
          }
        >
          <Input placeholder="Contoh: kppi_2026" prefix={<IconFile size={14} color="#868e96" />} />
        </Form.Item>

        <Form.Item
          label={
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <IconUpload size={14} />
              <span>Upload Dokumen Lampiran</span>
            </div>
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
  const screens = useBreakpoint();
  const isXs = !screens?.sm;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconEdit size={18} />
          <span>Edit Lampiran</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      width={isXs ? "95%" : 550}
      destroyOnClose
      centered={isXs}
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
      <Card size="small" style={{ marginBottom: 16, background: "#fafafa" }} bordered>
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Text type="secondary" style={{ width: 100 }}>File Saat Ini:</Text>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <IconFile size={14} color="#868e96" />
              <Text strong>{data.file_name}</Text>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Text type="secondary" style={{ width: 100 }}>Ukuran:</Text>
            <Text>{formatFileSize(data.file_size)}</Text>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Text type="secondary" style={{ width: 100 }}>Tipe:</Text>
            <FileTypeTag type={data.file_type} />
          </div>
          {data.file_url && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Text type="secondary" style={{ width: 100 }}>URL:</Text>
              <a href={data.file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>
                Buka file
              </a>
            </div>
          )}
        </Space>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ file_name: stripExtension(data.file_name) }}
      >
        <Form.Item
          name="file_name"
          label={
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <IconFile size={14} />
              <span>Nama File (tanpa extension)</span>
            </div>
          }
        >
          <Input
            placeholder="Nama file"
            prefix={<IconFile size={14} color="#868e96" />}
            suffix={<Text type="secondary" style={{ fontSize: 12 }}>.{currentExt || file?.name?.split(".").pop()}</Text>}
          />
        </Form.Item>

        <Form.Item
          label={
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <IconUpload size={14} />
              <span>Upload File Baru (Opsional)</span>
            </div>
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
  const screens = useBreakpoint();
  const isXs = !screens?.sm;

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
  const { data, isLoading, refetch, isFetching } = useQuery(
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
      align: 'center',
      render: (_, __, index) => (filters.page - 1) * filters.limit + index + 1,
    },
    {
      title: "Nama File",
      dataIndex: "file_name",
      key: "file_name",
      ellipsis: true,
      render: (val) => (
        <Tooltip title={val}>
          <Space>
            <IconFile size={16} color="#868e96" />
            <Text>{stripExtension(val)}</Text>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: "Ukuran",
      dataIndex: "file_size",
      key: "file_size",
      width: 100,
      render: (val) => <Text type="secondary" style={{ fontSize: 12 }}>{formatFileSize(val)}</Text>,
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
            <Button
              type="text"
              icon={<IconEye size={16} />}
              style={{ color: "#1890ff" }}
              onClick={() => window.open(val, "_blank")}
            />
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
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
      render: (val) => <Text type="secondary" style={{ fontSize: 12 }}>{val?.username || "-"}</Text>,
    },
    {
      title: "Upload at",
      dataIndex: "dibuat_pada",
      key: "dibuat_pada",
      width: 130,
      render: (val) => <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(val).format("DD-MM-YYYY HH:mm")}</Text>,
    },
    {
      title: "Aksi",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          {isEditable && (
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<IconEdit size={16} />}
                style={{ color: "#1890ff" }}
                onClick={() => setEditModal({ open: true, data: record })}
              />
            </Tooltip>
          )}
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<IconDownload size={16} />}
              style={{ color: "#52c41a" }}
              onClick={() => handleDownload(record)}
              loading={downloading === record.lampiran_id}
            />
          </Tooltip>
          {isEditable && (
            <Popconfirm
              title="Hapus lampiran?"
              onConfirm={() => hapusLampiran(record.lampiran_id)}
              okText="Ya"
              cancelText="Tidak"
            >
              <Tooltip title="Hapus">
                <Button
                  type="text"
                  icon={<IconTrash size={16} />}
                  danger
                  loading={isDeleting}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
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
    <div>
      <div style={{ maxWidth: "100%" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              background: "#FF4500",
              color: "white",
              padding: "24px",
              textAlign: "center",
              borderRadius: "12px 12px 0 0",
              margin: "-24px -24px 0 -24px",
            }}
          >
            <IconPaperclip size={32} style={{ marginBottom: 8 }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Daftar Lampiran
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
              Dokumen pendukung usulan formasi
            </Text>
          </div>

          {/* Filter and Actions Section */}
          <div style={{ padding: "20px 0 16px 0", borderBottom: "1px solid #f0f0f0" }}>
            <Row gutter={[12, 12]} align="middle" justify="space-between">
              <Col xs={24} md={12}>
                <Input.Search
                size="small"
                  placeholder="Cari file..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  allowClear
                  style={{ width: "100%" }}
                />
              </Col>
              <Col xs={24} md={12} style={{ display: "flex", justifyContent: isXs ? "flex-start" : "flex-end" }}>
                <Space wrap>
                  <Tooltip title="Refresh">
                    <Button
                        icon={<IconRefresh size={16} />}
                        onClick={() => refetch()}
                        loading={isLoading || isFetching}
                    />
                  </Tooltip>
                  <Button
                    icon={<IconDownload size={16} />}
                    loading={downloadingExcel}
                    onClick={handleDownloadExcel}
                    type="primary"
                    ghost
                  >
                    Unduh
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
                        icon={<IconPlus size={16} />}
                        onClick={() => setUploadModal(true)}
                        disabled={formasi?.status !== "aktif"}
                        style={{ background: "#FF4500", borderColor: "#FF4500" }}
                      >
                        Tambah Lampiran
                      </Button>
                    </Tooltip>
                  )}
                </Space>
              </Col>
            </Row>
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
            <Table
              dataSource={data?.data || []}
              columns={columns}
              rowKey="lampiran_id"
              size="middle"
              loading={isLoading || isFetching}
              pagination={{
                position: ["bottomRight"],
                current: Number(lPage),
                pageSize: Number(lLimit),
                total: data?.meta?.total || 0,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} file`,
                onChange: (p, l) => updateFilters({ lPage: p, lLimit: l }),
              }}
              scroll={{ x: 800 }}
            />
          </div>
        </Card>
      </div>

      {/* Modals */}
      <UploadModal open={uploadModal} onClose={() => setUploadModal(false)} formasiId={formasiId} />
      <EditModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, data: null })}
        data={editModal.data}
      />
    </div>
  );
}

export default LampiranList;
