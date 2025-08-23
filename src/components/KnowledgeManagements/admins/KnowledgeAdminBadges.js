import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Typography,
  Card,
  Tag,
  Flex,
  Grid,
  Affix,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
  SettingOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import {
  useFetchBadges,
  useCreateBadge,
  useUpdateBadge,
  useDeleteBadge,
} from "@/hooks/knowledge-management/useBadges";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const KnowledgeAdminBadges = () => {
  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // State untuk form dan modal
  const [form] = Form.useForm();
  const [modalTerbuka, setModalTerbuka] = useState(false);
  const [badgeDipilih, setBadgeDipilih] = useState(null);
  const [sedangEdit, setSedangEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // React Query hooks
  const { data: daftarBadges = [], isLoading: sedangMeload } = useFetchBadges();

  const mutasiTambah = useCreateBadge();
  const mutasiUpdate = useUpdateBadge();
  const mutasiHapus = useDeleteBadge();

  // Filter data berdasarkan search term
  const filteredBadges = daftarBadges.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      title: "Badge",
      key: "badge",
      width: 100,
      render: (_, record) => (
        <Flex align="center" gap="small">
          {record.icon_url ? (
            <Avatar src={record.icon_url} size={40} />
          ) : (
            <Avatar
              icon={<TrophyOutlined />}
              size={40}
              style={{ backgroundColor: "#FF4500" }}
            />
          )}
        </Flex>
      ),
    },
    {
      title: "Nama Badge",
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
      title: "Poin Required",
      dataIndex: "points_required",
      key: "points_required",
      width: 120,
      render: (poin) => (
        <Tag color="gold">
          {poin ? `${poin} Poin` : "0 Poin"}
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
            title="Edit badge"
          />
          <Popconfirm
            title="Konfirmasi Hapus"
            description={`Apakah Anda yakin ingin menghapus badge "${record.name}"?`}
            onConfirm={() => hapusBadge(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Hapus badge"
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
    setBadgeDipilih(null);
    form.resetFields();
  };

  // Handler untuk membuka modal edit
  const bukaModalEdit = (badge) => {
    setSedangEdit(true);
    setBadgeDipilih(badge);
    setModalTerbuka(true);
    form.setFieldsValue({
      name: badge.name,
      description: badge.description,
      icon_url: badge.icon_url,
      points_required: badge.points_required,
    });
  };

  // Handler untuk menutup modal
  const tutupModal = () => {
    setModalTerbuka(false);
    setBadgeDipilih(null);
    setSedangEdit(false);
    form.resetFields();
  };

  // Handler untuk submit form
  const submitForm = async () => {
    try {
      const nilaiForm = await form.validateFields();

      if (sedangEdit && badgeDipilih) {
        // Update badge yang sudah ada
        await mutasiUpdate.mutateAsync({
          id: badgeDipilih.id,
          data: nilaiForm,
        });
      } else {
        // Tambah badge baru
        await mutasiTambah.mutateAsync(nilaiForm);
      }

      tutupModal();
    } catch (error) {
      console.error("Gagal validasi form:", error);
    }
  };

  // Handler untuk hapus badge
  const hapusBadge = async (id) => {
    try {
      await mutasiHapus.mutateAsync(id);
    } catch (error) {
      console.error("Gagal menghapus badge:", error);
    }
  };


  return (
    <>
      {/* Affix Header */}
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
                Admin - Manajemen Badges
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
                Tambah Badge
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
            {/* Icon Section */}
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
                <TrophyOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
              </div>
            )}

            {/* Content Section */}
            <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
              {/* Search Input */}
              <div style={{ marginBottom: "16px" }}>
                <Input
                  placeholder="Cari berdasarkan nama atau deskripsi badge..."
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
                    🏆 Badges
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
                dataSource={filteredBadges}
                rowKey="id"
                loading={sedangMeload}
                size={isMobile ? "small" : "middle"}
                pagination={{
                  pageSize: isMobile ? 5 : 10,
                  showSizeChanger: !isMobile,
                  showQuickJumper: !isMobile,
                  showTotal: (total, range) => {
                    const filtered = searchTerm ? ` (difilter dari ${daftarBadges.length})` : "";
                    return isMobile
                      ? `${range[0]}-${range[1]} / ${total}${filtered}`
                      : `Menampilkan ${range[0]}-${range[1]} dari ${total} badges${filtered}`;
                  },
                  size: isMobile ? "small" : "default",
                }}
                scroll={isMobile ? { x: 600 } : undefined}
              />
            </div>
          </Flex>
        </Card>
      </div>

      {/* Modal untuk tambah/edit badge */}
      <Modal
        title={
          <Text strong>
            {sedangEdit ? "Edit Badge" : "Tambah Badge Baru"}
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
          >
            {sedangEdit ? "Update" : "Simpan"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
          <Form.Item
            label="Nama Badge"
            name="name"
            rules={[
              {
                required: true,
                message: "Nama badge wajib diisi!",
              },
              {
                min: 3,
                message: "Nama badge minimal 3 karakter!",
              },
              {
                max: 100,
                message: "Nama badge maksimal 100 karakter!",
              },
            ]}
          >
            <Input
              placeholder="Contoh: Kontributor Aktif, Expert Helper, dll"
              size={isMobile ? "middle" : "large"}
              style={{
                borderRadius: "6px",
                borderColor: "#EDEFF1",
              }}
            />
          </Form.Item>

          <Form.Item
            label="Deskripsi (Opsional)"
            name="description"
            rules={[
              {
                max: 500,
                message: "Deskripsi maksimal 500 karakter!",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Masukkan deskripsi singkat tentang badge ini..."
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

          <Form.Item
            label="URL Icon (Opsional)"
            name="icon_url"
            rules={[
              {
                type: "url",
                message: "Format URL tidak valid!",
              },
            ]}
          >
            <Input
              placeholder="https://example.com/icon.png"
              size={isMobile ? "middle" : "large"}
              prefix={<LinkOutlined />}
              style={{
                borderRadius: "6px",
                borderColor: "#EDEFF1",
              }}
            />
          </Form.Item>

          <Form.Item
            label="Poin Required"
            name="points_required"
            rules={[
              {
                type: "number",
                min: 0,
                message: "Poin harus berupa angka positif!",
              },
            ]}
          >
            <InputNumber
              placeholder="0"
              min={0}
              style={{ width: "100%" }}
              size={isMobile ? "middle" : "large"}
            />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
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

        .ant-card .ant-card-body > div:first-child {
          border-top-left-radius: inherit !important;
          border-bottom-left-radius: inherit !important;
        }

        .ant-card .ant-card-body > div:first-child > div:last-child {
          border-top-right-radius: inherit !important;
          border-bottom-right-radius: inherit !important;
        }

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

export default KnowledgeAdminBadges;
