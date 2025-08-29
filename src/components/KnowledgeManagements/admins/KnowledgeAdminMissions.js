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
  Steps,
  Divider,
  Collapse,
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
  const [currentStep, setCurrentStep] = useState(0);

  // React Query hooks
  const { data: daftarMissions = [], isLoading: sedangMeload } =
    useFetchMissions();

  const mutasiTambah = useCreateMission();
  const mutasiUpdate = useUpdateMission();
  const mutasiHapus = useDeleteMission();

  // Filter data berdasarkan search term
  const filteredMissions = daftarMissions.filter((item) => {
    if (!searchTerm) return true; // Jika tidak ada search term, tampilkan semua
    return (
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
      title: "Mission",
      key: "mission",
      render: (_, record) => {
        const expandedRowRender = () => (
          <div style={{ padding: "16px 0" }}>
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <div>
                <Text strong>Deskripsi:</Text>{" "}
                {record.description || "Tidak ada"}
              </div>
              <div>
                <Text strong>Frekuensi:</Text> <Tag>{record.frequency}</Tag>
              </div>
              <div>
                <Text strong>Target:</Text> {record.target_count || 0}
              </div>
              <div>
                <Text strong>Poin:</Text> {record.points_reward || 0}
              </div>

              {record.start_date && (
                <div>
                  <Text strong>Periode:</Text>{" "}
                  {dayjs(record.start_date).format("DD/MM/YYYY")} -{" "}
                  {record.end_date
                    ? dayjs(record.end_date).format("DD/MM/YYYY")
                    : "Selamanya"}
                </div>
              )}

              <div>
                <Text strong>Rule:</Text>
                {(() => {
                  let rule = record?.rule;
                  if (typeof rule === "string") {
                    try {
                      rule = JSON.parse(rule);
                    } catch {
                      rule = null;
                    }
                  }
                  return (
                    <Space>
                      <Tag>{rule?.action || "read_complete"}</Tag>
                      <Tag>{rule?.ref_type || "content"}</Tag>
                      <Tag>{rule?.distinct_by || "ref_id"}</Tag>
                    </Space>
                  );
                })()}
              </div>

              <div>
                <Text strong>Klaim:</Text>
                <Space>
                  <Tag>Max: {record?.max_claims_per_period ?? 1}/periode</Tag>
                  <Tag color={record?.auto_claim ? "green" : "default"}>
                    {record?.auto_claim ? "Auto" : "Manual"}
                  </Tag>
                  <Tag>{record?.period_timezone || "UTC"}</Tag>
                </Space>
              </div>
            </Space>
          </div>
        );

        return (
          <Collapse ghost>
            <Collapse.Panel
              header={<Text strong>{record.title}</Text>}
              key="1"
              extra={
                <Space onClick={(e) => e.stopPropagation()}>
                  <Tag color={record.is_active ? "success" : "default"}>
                    {record.is_active ? "Aktif" : "Nonaktif"}
                  </Tag>
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => bukaModalEdit(record)}
                    size="small"
                  />
                  <Popconfirm
                    title="Hapus mission?"
                    onConfirm={() => hapusMission(record.id)}
                    okText="Ya"
                    cancelText="Batal"
                  >
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                    />
                  </Popconfirm>
                </Space>
              }
            >
              {expandedRowRender()}
            </Collapse.Panel>
          </Collapse>
        );
      },
    },
  ];

  // Handler untuk membuka modal tambah
  const bukaModalTambah = () => {
    setModalTerbuka(true);
    setSedangEdit(false);
    setMissionDipilih(null);
    setCurrentStep(0);
    form.resetFields();
  };

  // Handler untuk membuka modal edit
  const bukaModalEdit = (mission) => {
    setSedangEdit(true);
    setMissionDipilih(mission);
    setModalTerbuka(true);
    setCurrentStep(0);

    // Parse rule JSON if exists
    let rule = mission?.rule;
    if (typeof rule === "string") {
      try {
        rule = JSON.parse(rule);
      } catch (_) {
        rule = null;
      }
    }

    const fieldValues = {
      title: mission.title,
      description: mission.description,
      frequency: mission.frequency,
      target_count: mission.target_count,
      points_reward: mission.points_reward,
      date_range:
        mission.start_date && mission.end_date
          ? [dayjs(mission.start_date), dayjs(mission.end_date)]
          : null,
      is_active: mission.is_active,
      // Rule fields
      rule_action: rule?.action || "read_complete",
      rule_ref_type: rule?.ref_type || "content",
      rule_distinct_by: rule?.distinct_by || "ref_id",
      // Claim fields
      auto_claim: mission?.auto_claim ?? true,
      max_claims_per_period: mission?.max_claims_per_period ?? 1,
      period_timezone: mission?.period_timezone || "",
    };

    // Delay untuk memastikan modal sudah terbuka dan form ter-render
    setTimeout(() => {
      form.setFieldsValue(fieldValues);
    }, 100);
  };

  // Handler untuk menutup modal
  const tutupModal = () => {
    setModalTerbuka(false);
    setMissionDipilih(null);
    setSedangEdit(false);
    setCurrentStep(0);
    form.resetFields();
  };

  // Handler untuk submit form
  const submitForm = async () => {
    try {
      // Validasi semua field dari semua steps
      await form.validateFields([
        'title', 'description', 'frequency', 'target_count', 'points_reward',
        'rule_action', 'rule_ref_type', 'rule_distinct_by',
        'auto_claim', 'max_claims_per_period', 'period_timezone', 'date_range', 'is_active'
      ]);
      
      // Ambil semua values
      const nilaiForm = form.getFieldsValue(true);
      
      console.log("All form values:", nilaiForm);

      // Format data untuk API
      const formattedData = {
        title: nilaiForm.title,
        description: nilaiForm.description,
        frequency: nilaiForm.frequency,
        target_count: nilaiForm.target_count,
        points_reward: nilaiForm.points_reward,
        start_date: nilaiForm.date_range?.[0]?.toISOString(),
        end_date: nilaiForm.date_range?.[1]?.toISOString(),
        is_active: nilaiForm.is_active ?? true,
        auto_claim: nilaiForm.auto_claim ?? true,
        max_claims_per_period: nilaiForm.max_claims_per_period ?? 1,
        period_timezone: nilaiForm.period_timezone || null,
        rule: {
          type: "action_count",
          action: nilaiForm.rule_action || "read_complete",
          ref_type: nilaiForm.rule_ref_type || "content",
          target_count: nilaiForm.target_count,
          distinct_by: nilaiForm.rule_distinct_by || "ref_id",
        },
      };
      
      console.log("Final formattedData:", formattedData);

      if (sedangEdit && missionDipilih) {
        // Update mission yang sudah ada
        await mutasiUpdate.mutateAsync({
          id: missionDipilih.id,
          data: formattedData,
        });
      } else {
        console.log("formattedData", formattedData);
        // Tambah mission baru
        await mutasiTambah.mutateAsync(formattedData);
      }

      tutupModal();
    } catch (error) {
      console.error("Gagal validasi form:", error);
    }
  };

  // Steps config
  const stepsItems = [
    { title: "Info Dasar" },
    { title: "Aturan" },
    { title: "Klaim" },
    { title: "Review" },
  ];

  const stepFields = [
    // Step 0: Info Dasar
    [
      "title",
      "description", 
      "frequency",
      "target_count",
      "points_reward",
    ],
    // Step 1: Aturan
    ["rule_action", "rule_ref_type", "rule_distinct_by"],
    // Step 2: Klaim
    [
      "auto_claim", 
      "max_claims_per_period", 
      "period_timezone",
      "date_range",
      "is_active",
    ],
    // Step 3: Review (no validation needed)
    [],
  ];

  const handleNext = async () => {
    try {
      const fields = stepFields[currentStep] || [];
      if (fields.length > 0) await form.validateFields(fields);
      setCurrentStep((s) => Math.min(s + 1, stepsItems.length - 1));
    } catch (e) {
      // validation errors are shown by antd
    }
  };

  const handlePrev = () => setCurrentStep((s) => Math.max(0, s - 1));

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
              <SettingOutlined />
              <Text strong>Admin - Manajemen Missions</Text>
            </Flex>
            {!isMobile && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={bukaModalTambah}
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
                <TrophyOutlined />
              </div>
            )}

            {/* Content Section */}
            <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
              {/* Search Input */}
              <div style={{ marginBottom: "16px" }}>
                <Input
                  placeholder="Cari mission..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                />
              </div>

              {/* Mobile Header */}
              {isMobile && (
                <Flex
                  align="center"
                  justify="space-between"
                  style={{ marginBottom: "16px" }}
                >
                  <Title level={4} style={{ margin: 0 }}>
                    Missions
                  </Title>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={bukaModalTambah}
                    size="small"
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
                size="small"
                pagination={{
                  pageSize: 10,
                  showTotal: (total, range) => {
                    const filtered = searchTerm
                      ? ` (filtered dari ${daftarMissions.length})`
                      : "";
                    return `${range[0]}-${range[1]} dari ${total} missions${filtered}`;
                  },
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                locale={{
                  emptyText: searchTerm
                    ? `Tidak ada missions yang cocok dengan "${searchTerm}"`
                    : "Belum ada missions. Klik 'Tambah Mission' untuk membuat yang pertama.",
                }}
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
            key="cancel"
            onClick={tutupModal}
            size={isMobile ? "middle" : "large"}
          >
            Batal
          </Button>,
          currentStep > 0 && (
            <Button
              key="prev"
              onClick={handlePrev}
              size={isMobile ? "middle" : "large"}
            >
              Kembali
            </Button>
          ),
          currentStep < 3 ? (
            <Button
              key="next"
              type="primary"
              onClick={handleNext}
              size={isMobile ? "middle" : "large"}
            >
              Lanjut
            </Button>
          ) : (
            <Button
              key="submit"
              type="primary"
              loading={mutasiTambah.isPending || mutasiUpdate.isPending}
              onClick={submitForm}
              size={isMobile ? "middle" : "large"}
            >
              {sedangEdit ? "Update" : "Simpan"}
            </Button>
          ),
        ]}
      >
        <Steps
          current={currentStep}
          items={stepsItems}
          size={isMobile ? "small" : "default"}
        />
        <Divider />
        <Form form={form} layout="vertical">
          {currentStep === 0 && (
            <>
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
                <Input placeholder="Contoh: Baca 3 artikel per hari" />
              </Form.Item>

              <Form.Item label="Deskripsi" name="description">
                <TextArea
                  placeholder="Deskripsi mission..."
                  rows={3}
                  maxLength={500}
                />
              </Form.Item>

              <Space.Compact style={{ width: "100%", display: "flex" }}>
                <Form.Item
                  label="Frekuensi"
                  name="frequency"
                  style={{ flex: 1 }}
                  rules={[{ required: true, message: "Pilih frekuensi!" }]}
                  initialValue="daily"
                >
                  <Select
                    placeholder="Pilih frekuensi"
                    options={frequencyOptions}
                  />
                </Form.Item>

                <Form.Item
                  label="Target"
                  name="target_count"
                  style={{ flex: 1, marginLeft: 16 }}
                  rules={[
                    { type: "number", min: 1, message: "Target minimal 1!" },
                  ]}
                >
                  <InputNumber
                    placeholder="1"
                    min={1}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Space.Compact>

              <Form.Item
                label="Poin"
                name="points_reward"
                rules={[{ type: "number", min: 0, message: "Poin minimal 0!" }]}
              >
                <InputNumber
                  placeholder="10"
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </>
          )}

          {currentStep === 1 && (
            <>
              <Form.Item
                label="Aksi"
                name="rule_action"
                rules={[{ required: true, message: "Pilih aksi!" }]}
                initialValue="read_complete"
              >
                <Select
                  options={[
                    { label: "Baca Konten", value: "read_complete" },
                    { label: "Komentar", value: "comment_content" },
                    { label: "Like", value: "like_content" },
                    { label: "Publish", value: "publish_content" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Tipe Referensi"
                name="rule_ref_type"
                rules={[{ required: true, message: "Pilih tipe!" }]}
                initialValue="content"
              >
                <Select options={[{ label: "Content", value: "content" }]} />
              </Form.Item>

              <Form.Item
                label="Perhitungan"
                name="rule_distinct_by"
                initialValue="ref_id"
              >
                <Select
                  options={[
                    { label: "Per konten (unique)", value: "ref_id" },
                    { label: "Semua aksi", value: "none" },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {currentStep === 2 && (
            <>
              <Form.Item
                label="Auto Claim"
                name="auto_claim"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Max Klaim per Periode"
                name="max_claims_per_period"
                initialValue={1}
                rules={[{ type: "number", min: 1, message: "Minimal 1" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="Timezone" name="period_timezone">
                <Input placeholder="Asia/Jakarta" />
              </Form.Item>

              <Form.Item label="Periode" name="date_range">
                <RangePicker
                  placeholder={["Mulai", "Selesai"]}
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Status"
                name="is_active"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </>
          )}

          {currentStep === 3 &&
            (() => {
              const v = form.getFieldsValue(true);
              return (
                <Card title="Review Data">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <Text strong>Judul:</Text> {v.title || "-"}
                    </div>
                    <div>
                      <Text strong>Deskripsi:</Text> {v.description || "-"}
                    </div>
                    <div>
                      <Text strong>Frekuensi:</Text>{" "}
                      <Tag>{v.frequency || "-"}</Tag>
                    </div>
                    <div>
                      <Text strong>Target:</Text> {v.target_count || 0}
                    </div>
                    <div>
                      <Text strong>Poin:</Text> {v.points_reward || 0}
                    </div>
                    <div>
                      <Text strong>Periode:</Text>{" "}
                      {v.date_range?.length
                        ? `${v.date_range[0]?.format?.(
                            "DD/MM/YYYY"
                          )} - ${v.date_range[1]?.format?.("DD/MM/YYYY")}`
                        : "Tidak terbatas"}
                    </div>
                    <div>
                      <Text strong>Aksi:</Text>{" "}
                      <Tag>{v.rule_action || "-"}</Tag>
                    </div>
                    <div>
                      <Text strong>Auto Claim:</Text>{" "}
                      {v.auto_claim ? "Ya" : "Tidak"}
                    </div>
                    <div>
                      <Text strong>Status:</Text>{" "}
                      {v.is_active ? "Aktif" : "Nonaktif"}
                    </div>
                  </Space>
                </Card>
              );
            })()}
        </Form>
      </Modal>
    </>
  );
};

export default KnowledgeAdminMissions;
