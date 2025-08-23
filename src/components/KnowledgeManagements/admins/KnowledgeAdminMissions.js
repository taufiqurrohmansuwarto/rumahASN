import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Switch,
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
  TrophyOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  useFetchMissions,
  useCreateMission,
  useUpdateMission,
  useDeleteMission,
} from "@/hooks/knowledge-management/useMissions";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const KnowledgeAdminMissions = () => {
  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // State untuk form dan modal
  const [form] = Form.useForm();
  const [modalTerbuka, setModalTerbuka] = useState(false);
  const [missionDipilih, setMissionDipilih] = useState(null);
  const [sedangEdit, setSedangEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // React Query hooks
  const { data: daftarMissions = [], isLoading: sedangMeload } = useFetchMissions();

  const mutasiTambah = useCreateMission();
  const mutasiUpdate = useUpdateMission();
  const mutasiHapus = useDeleteMission();

  // Filter data berdasarkan search term
  const filteredMissions = daftarMissions.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Options untuk frequency
  const frequencyOptions = [
    { label: "Harian", value: "daily" },
    { label: "Mingguan", value: "weekly" },
    { label: "Bulanan", value: "monthly" },
    { label: "Sekali", value: "once" },
  ];

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
      title: "Judul Mission",
      dataIndex: "title",
      key: "title",
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
      title: "Frekuensi",
      dataIndex: "frequency",
      key: "frequency",
      width: 100,
      render: (freq) => {
        const colors = {
          daily: "blue",
          weekly: "green",
          monthly: "purple",
          once: "orange",
        };
        const labels = {
          daily: "Harian",
          weekly: "Mingguan",
          monthly: "Bulanan",
          once: "Sekali",
        };
        return (
          <Tag color={colors[freq] || "default"}>
            {labels[freq] || freq}
          </Tag>
        );
      },
    },
    {
      title: "Poin Reward",
      dataIndex: "points_reward",
      key: "points_reward",
      width: 120,
      render: (poin) => (
        <Tag color="gold">
          {poin ? `${poin} Poin` : "0 Poin"}
        </Tag>
      ),
    },
    {
      title: "Periode",
      key: "periode",
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: "12px" }}>
          {record.start_date && (
            <div>
              <strong>Mulai:</strong> {dayjs(record.start_date).format("DD/MM/YYYY")}
            </div>
          )}
          {record.end_date && (
            <div>
              <strong>Selesai:</strong> {dayjs(record.end_date).format("DD/MM/YYYY")}
            </div>
          )}
        </div>
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
            title="Edit mission"
          />
          <Popconfirm
            title="Konfirmasi Hapus"
            description={`Apakah Anda yakin ingin menghapus mission "${record.title}"?`}
            onConfirm={() => hapusMission(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Hapus mission"
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
    setMissionDipilih(null);
    form.resetFields();
  };

  // Handler untuk membuka modal edit
  const bukaModalEdit = (mission) => {
    setSedangEdit(true);
    setMissionDipilih(mission);
    setModalTerbuka(true);
    form.setFieldsValue({
      title: mission.title,
      description: mission.description,
      frequency: mission.frequency,
      points_reward: mission.points_reward,
      date_range: mission.start_date && mission.end_date 
        ? [dayjs(mission.start_date), dayjs(mission.end_date)]
        : null,
      is_active: mission.is_active,
    });
  };

  // Handler untuk menutup modal
  const tutupModal = () => {
    setModalTerbuka(false);
    setMissionDipilih(null);
    setSedangEdit(false);
    form.resetFields();
  };

  // Handler untuk submit form
  const submitForm = async () => {
    try {
      const nilaiForm = await form.validateFields();
      
      // Format data untuk API
      const formattedData = {
        title: nilaiForm.title,
        description: nilaiForm.description,
        frequency: nilaiForm.frequency,
        points_reward: nilaiForm.points_reward,
        start_date: nilaiForm.date_range?.[0]?.toISOString(),
        end_date: nilaiForm.date_range?.[1]?.toISOString(),
        is_active: nilaiForm.is_active ?? true,
      };

      if (sedangEdit && missionDipilih) {
        // Update mission yang sudah ada
        await mutasiUpdate.mutateAsync({
          id: missionDipilih.id,
          data: formattedData,
        });
      } else {
        // Tambah mission baru
        await mutasiTambah.mutateAsync(formattedData);
      }

      tutupModal();
    } catch (error) {
      console.error("Gagal validasi form:", error);
    }
  };

  // Handler untuk hapus mission
  const hapusMission = async (id) => {
    try {
      await mutasiHapus.mutateAsync(id);
    } catch (error) {
      console.error("Gagal menghapus mission:", error);
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
                Admin - Manajemen Missions
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
                Tambah Mission
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
                  placeholder="Cari berdasarkan judul atau deskripsi mission..."
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
                    🎯 Missions
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
                dataSource={filteredMissions}
                rowKey="id"
                loading={sedangMeload}
                size={isMobile ? "small" : "middle"}
                pagination={{
                  pageSize: isMobile ? 5 : 10,
                  showSizeChanger: !isMobile,
                  showQuickJumper: !isMobile,
                  showTotal: (total, range) => {
                    const filtered = searchTerm ? ` (difilter dari ${daftarMissions.length})` : "";
                    return isMobile
                      ? `${range[0]}-${range[1]} / ${total}${filtered}`
                      : `Menampilkan ${range[0]}-${range[1]} dari ${total} missions${filtered}`;
                  },
                  size: isMobile ? "small" : "default",
                }}
                scroll={isMobile ? { x: 800 } : undefined}
              />
            </div>
          </Flex>
        </Card>
      </div>

      {/* Modal untuk tambah/edit mission */}
      <Modal
        title={
          <Text strong>
            {sedangEdit ? "Edit Mission" : "Tambah Mission Baru"}
          </Text>
        }
        open={modalTerbuka}
        onCancel={tutupModal}
        width={isMobile ? "90%" : 700}
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
            label="Judul Mission"
            name="title"
            rules={[
              {
                required: true,
                message: "Judul mission wajib diisi!",
              },
              {
                min: 3,
                message: "Judul mission minimal 3 karakter!",
              },
              {
                max: 255,
                message: "Judul mission maksimal 255 karakter!",
              },
            ]}
          >
            <Input
              placeholder="Contoh: Posting Artikel Harian, Review Dokumen, dll"
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
          >
            <TextArea
              placeholder="Masukkan deskripsi detail tentang mission ini..."
              rows={isMobile ? 3 : 4}
              size={isMobile ? "middle" : "large"}
              style={{
                borderRadius: "6px",
                borderColor: "#EDEFF1",
              }}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              label="Frekuensi"
              name="frequency"
              style={{ flex: 1 }}
              rules={[
                {
                  required: true,
                  message: "Frekuensi wajib dipilih!",
                },
              ]}
              initialValue="daily"
            >
              <Select
                placeholder="Pilih frekuensi"
                size={isMobile ? "middle" : "large"}
                options={frequencyOptions}
                style={{
                  borderRadius: "6px",
                }}
              />
            </Form.Item>

            <Form.Item
              label="Poin Reward"
              name="points_reward"
              style={{ flex: 1 }}
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
          </div>

          <Form.Item
            label="Periode Mission"
            name="date_range"
          >
            <RangePicker
              placeholder={["Tanggal Mulai", "Tanggal Selesai"]}
              format="DD/MM/YYYY"
              size={isMobile ? "middle" : "large"}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Status Aktif"
            name="is_active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch 
              checkedChildren="Aktif" 
              unCheckedChildren="Nonaktif" 
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

export default KnowledgeAdminMissions;
