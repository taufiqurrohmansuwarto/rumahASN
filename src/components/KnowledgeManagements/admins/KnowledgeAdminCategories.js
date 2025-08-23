import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  Typography,
  Card,
  Tag,
  Flex,
  Grid,
  Affix,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  useFetchCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/knowledge-management/useCategories";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const KnowledgeAdminCategories = () => {
  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  // State untuk form dan modal
  const [form] = Form.useForm();
  const [modalTerbuka, setModalTerbuka] = useState(false);
  const [kategoriDipilih, setKategoriDipilih] = useState(null);
  const [sedangEdit, setSedangEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // React Query hooks
  const { data: daftarKategori = [], isLoading: sedangMeload } =
    useFetchCategories();

  // Filter data berdasarkan search term
  const filteredKategori = daftarKategori.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mutasiTambah = useCreateCategory();
  const mutasiUpdate = useUpdateCategory();
  const mutasiHapus = useDeleteCategory();

  // Konfigurasi kolom tabel
  const kolomTabel = [
    {
      title: "No",
      key: "nomor",
      width: 60,
      render: (_, __, indeks) => (
        <span style={{ fontWeight: "500" }}>{indeks + 1}</span>
      ),
    },
    {
      title: "Nama Kategori",
      dataIndex: "name",
      key: "name",
      render: (teks) => (
        <span
          style={{
            fontWeight: "600",
            color: "#1890ff",
          }}
        >
          {teks}
        </span>
      ),
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (teks) =>
        teks ? (
          <span style={{ color: "#666" }}>{teks}</span>
        ) : (
          <span style={{ color: "#ccc", fontStyle: "italic" }}>
            Tidak ada deskripsi
          </span>
        ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status ? "success" : "default"}>
          {status ? "Aktif" : "Nonaktif"}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: isMobile ? 80 : 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => bukaModalEdit(record)}
            size="small"
            style={{ color: "#FF4500" }}
            title="Edit kategori"
          />
          <Popconfirm
            title="Konfirmasi Hapus"
            description={`Apakah Anda yakin ingin menghapus kategori "${record.name}"?`}
            onConfirm={() => hapusKategori(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Hapus kategori"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Handler untuk membuka modal tambah
  const bukaModalTambah = () => {
    setModalTerbuka(true);
    setSedangEdit(false);
    setKategoriDipilih(null);
    form.resetFields();
  };

  // Handler untuk membuka modal edit
  const bukaModalEdit = (kategori) => {
    setSedangEdit(true);
    setKategoriDipilih(kategori);
    setModalTerbuka(true);
    form.setFieldsValue({
      name: kategori.name,
      description: kategori.description,
    });
  };

  // Handler untuk menutup modal
  const tutupModal = () => {
    setModalTerbuka(false);
    setKategoriDipilih(null);
    setSedangEdit(false);
    form.resetFields();
  };

  // Handler untuk submit form
  const submitForm = async () => {
    try {
      const nilaiForm = await form.validateFields();

      if (sedangEdit && kategoriDipilih) {
        // Update kategori yang sudah ada
        await mutasiUpdate.mutateAsync({
          id: kategoriDipilih.id,
          data: nilaiForm,
        });
      } else {
        // Tambah kategori baru
        await mutasiTambah.mutateAsync(nilaiForm);
      }

      tutupModal();
    } catch (error) {
      console.error("Gagal validasi form:", error);
    }
  };

  // Handler untuk hapus kategori
  const hapusKategori = async (id) => {
    try {
      await mutasiHapus.mutateAsync(id);
    } catch (error) {
      console.error("Gagal menghapus kategori:", error);
    }
  };


  return (
    <>
      {/* Affix Header - sama seperti KnowledgeContentHeader */}
      <Affix offsetTop={0}>
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid #EDEFF1",
            padding: isMobile ? "8px 16px" : "12px 24px",
            zIndex: 1000,
          }}
        >
          <Flex align="center" justify="space-between">
            <Flex align="center" gap="small">
              <SettingOutlined
                style={{
                  color: "#FF4500",
                  fontSize: isMobile ? "18px" : "20px",
                }}
              />
              <Text
                strong
                style={{
                  color: "#1A1A1B",
                  fontSize: isMobile ? "14px" : "16px",
                  lineHeight: "1.4",
                }}
              >
                Admin - Manajemen Kategori
              </Text>
            </Flex>
            {!isMobile && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={bukaModalTambah}
                style={{
                  borderRadius: "6px",
                  backgroundColor: "#FF4500",
                  borderColor: "#FF4500",
                }}
              >
                Tambah Kategori
              </Button>
            )}
          </Flex>
        </div>
      </Affix>

      <div
        style={{
          marginTop: isMobile ? "8px" : "12px",
        }}
      >
        <Card>
          <Flex>
            {/* Icon Section - Hide on mobile, sama seperti komponen lain */}
            {!isMobile && (
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  borderRight: "1px solid #EDEFF1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "500px",
                }}
              >
                <BookOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
              </div>
            )}

            {/* Content Section */}
            <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
              {/* Search Input */}
              <div style={{ marginBottom: "16px" }}>
                <Input
                  placeholder="Cari berdasarkan nama atau deskripsi kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                  size={isMobile ? "middle" : "large"}
                  style={{
                    borderRadius: "6px",
                    borderColor: "#EDEFF1",
                  }}
                />
              </div>
              {/* Mobile Header */}
              {isMobile && (
                <Flex
                  align="center"
                  justify="space-between"
                  style={{ marginBottom: "16px" }}
                >
                  <Title level={4} style={{ margin: 0, color: "#1A1A1B" }}>
                    📚 Kategori Knowledge
                  </Title>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={bukaModalTambah}
                    size="small"
                    style={{
                      borderRadius: "6px",
                      backgroundColor: "#FF4500",
                      borderColor: "#FF4500",
                    }}
                  >
                    Tambah
                  </Button>
                </Flex>
              )}
              <Table
                columns={kolomTabel}
                dataSource={filteredKategori}
                rowKey="id"
                loading={sedangMeload}
                size={isMobile ? "small" : "middle"}
                pagination={{
                  pageSize: isMobile ? 5 : 10,
                  showSizeChanger: !isMobile,
                  showQuickJumper: !isMobile,
                  showTotal: (total, range) => {
                    const filtered = searchTerm ? ` (difilter dari ${daftarKategori.length})` : "";
                    return isMobile
                      ? `${range[0]}-${range[1]} / ${total}${filtered}`
                      : `Menampilkan ${range[0]}-${range[1]} dari ${total} kategori${filtered}`;
                  },
                  size: isMobile ? "small" : "default",
                }}
                scroll={isMobile ? { x: 400 } : undefined}
              />
            </div>
          </Flex>
        </Card>
      </div>

      {/* Modal untuk tambah/edit kategori - dengan style konsisten */}
      <Modal
        title={
          <Text strong style={{ fontSize: "18px", color: "#1A1A1B" }}>
            {sedangEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
          </Text>
        }
        open={modalTerbuka}
        onCancel={tutupModal}
        width={isMobile ? "90%" : 600}
        centered={isMobile}
        footer={[
          <Button
            key="batal"
            onClick={tutupModal}
            size={isMobile ? "middle" : "large"}
          >
            Batal
          </Button>,
          <Button
            key="simpan"
            type="primary"
            loading={mutasiTambah.isPending || mutasiUpdate.isPending}
            onClick={submitForm}
            size={isMobile ? "middle" : "large"}
            style={{
              borderRadius: "6px",
              backgroundColor: "#FF4500",
              borderColor: "#FF4500",
            }}
          >
            {sedangEdit ? "Update" : "Simpan"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
          <Form.Item
            label={
              <span style={{ fontWeight: "600", fontSize: "14px" }}>
                Nama Kategori
              </span>
            }
            name="name"
            rules={[
              {
                required: true,
                message: "Nama kategori wajib diisi!",
              },
              {
                min: 3,
                message: "Nama kategori minimal 3 karakter!",
              },
              {
                max: 100,
                message: "Nama kategori maksimal 100 karakter!",
              },
            ]}
          >
            <Input
              placeholder="Contoh: Teknologi Informasi, Manajemen SDM, dll"
              size={isMobile ? "middle" : "large"}
              style={{
                borderRadius: "6px",
                borderColor: "#EDEFF1",
              }}
            />
          </Form.Item>

          <Form.Item
            label={
              <span style={{ fontWeight: "600", fontSize: "14px" }}>
                Deskripsi (Opsional)
              </span>
            }
            name="description"
            rules={[
              {
                max: 500,
                message: "Deskripsi maksimal 500 karakter!",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Masukkan deskripsi singkat tentang kategori ini..."
              rows={isMobile ? 3 : 4}
              size={isMobile ? "middle" : "large"}
              style={{
                borderRadius: "6px",
                borderColor: "#EDEFF1",
              }}
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        /* Sama seperti KnowledgeContentHeader dan KnowledgeContentBody */
        .ant-card {
          transition: all 0.3s ease !important;
          overflow: hidden !important;
          border-radius: 8px !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
          box-shadow: 0 2px 8px rgba(255, 69, 0, 0.15) !important;
        }

        .ant-card .ant-card-body {
          padding: 0 !important;
          border-radius: inherit !important;
        }

        /* Fix untuk icon section agar border radius konsisten */
        .ant-card .ant-card-body > div:first-child {
          border-top-left-radius: inherit !important;
          border-bottom-left-radius: inherit !important;
        }

        /* Fix untuk content section agar border radius konsisten */
        .ant-card .ant-card-body > div:first-child > div:last-child {
          border-top-right-radius: inherit !important;
          border-bottom-right-radius: inherit !important;
        }

        /* Table styling */
        .ant-table-thead > tr > th {
          background-color: #f8f9fa !important;
          border-bottom: 1px solid #edeff1 !important;
          color: #1a1a1b !important;
          font-weight: 600 !important;
        }

        .ant-table-tbody > tr:hover > td {
          background-color: rgba(255, 69, 0, 0.05) !important;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
        }

        /* Modal styling */
        .ant-modal-header {
          background-color: #f8f9fa !important;
          border-bottom: 1px solid #edeff1 !important;
          border-radius: 8px 8px 0 0 !important;
        }

        .ant-modal-body {
          padding: 24px !important;
        }

        /* Form styling */
        .ant-form-item-label > label {
          color: #1a1a1b !important;
          font-weight: 600 !important;
        }

        .ant-input:focus,
        .ant-input-focused {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.1) !important;
        }

        .ant-input:hover {
          border-color: #ff4500 !important;
        }

        /* Responsive table */
        @media (max-width: 768px) {
          .ant-table {
            font-size: 12px !important;
          }

          .ant-table-thead > tr > th {
            padding: 8px 4px !important;
            font-size: 12px !important;
          }

          .ant-table-tbody > tr > td {
            padding: 8px 4px !important;
            font-size: 12px !important;
          }

          .ant-affix {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 1000 !important;
          }
        }
      `}</style>
    </>
  );
};

export default KnowledgeAdminCategories;
