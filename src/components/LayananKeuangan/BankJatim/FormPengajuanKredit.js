import { getUserInfo, pengajuanKredit } from "@/services/bankjatim.services";
import { getJenisKredit, getKodeKabkota } from "@/utils/client-utils";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Steps,
  Typography,
  message,
  Flex,
  Grid,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const FormPengajuanKredit = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSynced, setIsSynced] = useState(false);

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { mutate: userInfo, isLoading: isUserInfoLoading } = useMutation({
    mutationFn: getUserInfo,
    onSuccess: (result) => {
      // Set kota_kantor based on kode_kabkota if available
      let kotaKantor = result.kota_kantor;
      if (!kotaKantor && result.kode_kabkota) {
        const selectedKota = getKodeKabkota.find(
          (item) => item.key === result.kode_kabkota
        );
        if (selectedKota) {
          kotaKantor = selectedKota.label.replace("\r", "");
        }
      }

      form.setFieldsValue({
        ...result,
        tgl_lahir: dayjs(result.tgl_lahir),
        kota_kantor: kotaKantor,
      });
      setIsSynced(true);
      setCurrentStep(1); // Auto move to next step
      message.success("Data kepegawaian berhasil diambil");
    },
  });

  const { mutate, isLoading } = useMutation((data) => pengajuanKredit(data), {
    onSuccess: (result) => {
      if (result?.data) {
        const { no_pengajuan, kantor_cabang } = result?.data;
        Modal.success({
          title: "Pengajuan Berhasil Disubmit",
          centered: true,
          width: 500,
          content: (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <CheckCircleOutlined
                style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }}
              />
              <Title level={4} style={{ marginBottom: 16, color: "#1f2937" }}>
                Pengajuan Kredit Berhasil Disubmit
              </Title>
              <div style={{ marginBottom: 20 }}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: "14px",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  No. Pengajuan:
                </Text>
                <Text strong style={{ fontSize: "16px", color: "#dc2626" }}>
                  {no_pengajuan}
                </Text>
              </div>
              <div style={{ marginBottom: 20 }}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: "14px",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Kantor Cabang:
                </Text>
                <Text strong style={{ fontSize: "14px", color: "#1f2937" }}>
                  {kantor_cabang}
                </Text>
              </div>
              <Text
                type="secondary"
                style={{ fontSize: "14px", lineHeight: "1.6" }}
              >
                Pengajuan kredit Anda telah berhasil disubmit ke sistem Bank
                Jatim. Silahkan simpan nomor pengajuan untuk keperluan
                pengecekan status selanjutnya.
              </Text>
            </div>
          ),
        });
        // Reset form after success
        setCurrentStep(0);
        setIsSynced(false);
        form.resetFields();
      } else {
        Modal.error({
          title: "Pengajuan Gagal",
          centered: true,
          content: (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <CloseCircleOutlined
                style={{ fontSize: 48, color: "#ff4d4f", marginBottom: 16 }}
              />
              <Title level={4} style={{ marginBottom: 8 }}>
                Bank Jatim Error
              </Title>
              <Text type="secondary">{result?.response_description}</Text>
            </div>
          ),
        });
      }
    },
    onError: (error) => {
      Modal.error({
        title: "Pengajuan Gagal",
        content: (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CloseCircleOutlined
              style={{ fontSize: 48, color: "#ff4d4f", marginBottom: 16 }}
            />
            <Title level={4} style={{ marginBottom: 8 }}>
              Terjadi Kesalahan
            </Title>
            <Text type="secondary">{error.response.data.message}</Text>
          </div>
        ),
      });
    },
  });

  const handleSubmit = async () => {
    try {
      const data = await form.validateFields();
      console.log(data);
      const payload = {
        ...data,
        tgl_lahir: dayjs(data.tgl_lahir).format("YYYY-MM-DD"),
      };
      mutate(payload);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      try {
        // Validate form fields before moving to next step
        await form.validateFields([
          "tmt_pensiun",
          "nama_dinas",
          "alamat_kantor",
          "kode_kabkota",
        ]);

        // Additional validation for kota_kantor
        const kotaKantor = form.getFieldValue("kota_kantor");
        if (!kotaKantor) {
          message.error(
            "Kota kantor tidak boleh kosong! Pilih kode kabkota terlebih dahulu."
          );
          return;
        }
        setCurrentStep(currentStep + 1);
      } catch (error) {
        // Form validation failed, don't move to next step
        console.log("Validation failed:", error);
        message.error("Mohon lengkapi semua field yang wajib diisi!");
        // Antd will automatically show error messages for failed fields
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Step 1: Fetching Data
  const renderStepOne = () => (
    <Flex
      vertical
      align="center"
      justify="center"
      style={{
        textAlign: "center",
        padding: isMobile ? "20px 16px" : "40px 20px",
      }}
    >
      <SyncOutlined
        style={{
          fontSize: isMobile ? 40 : 48,
          color: isSynced ? "#52c41a" : "#dc2626",
          marginBottom: isMobile ? 16 : 20,
        }}
      />
      <Title
        level={isMobile ? 4 : 3}
        style={{ marginBottom: 16, textAlign: "center" }}
      >
        {isSynced ? "Data Berhasil Diambil" : "Ambil Data Kepegawaian"}
      </Title>
      <Text
        type="secondary"
        style={{
          fontSize: isMobile ? 14 : 16,
          textAlign: "center",
          marginBottom: 32,
          maxWidth: isMobile ? "100%" : "80%",
        }}
      >
        {isSynced
          ? "Data kepegawaian Anda telah berhasil diambil dari sistem SIASN"
          : "Klik tombol di bawah untuk mengambil data kepegawaian dari sistem SIASN"}
      </Text>

      {!isSynced && (
        <Button
          type="primary"
          size={isMobile ? "middle" : "large"}
          icon={<SyncOutlined />}
          loading={isUserInfoLoading}
          onClick={() => userInfo()}
          style={{
            height: isMobile ? 40 : 48,
            paddingLeft: isMobile ? 16 : 24,
            paddingRight: isMobile ? 16 : 24,
            borderRadius: 8,
            background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
            border: "none",
            fontWeight: 600,
          }}
        >
          {isUserInfoLoading ? "Mengambil Data..." : "Ambil Data Kepegawaian"}
        </Button>
      )}
    </Flex>
  );

  // Step 2: Form Input (except credit data)
  const renderStepTwo = () => (
    <Flex vertical style={{ padding: isMobile ? "0 16px" : "0 20px" }}>
      <Flex
        justify="space-between"
        align={isMobile ? "flex-start" : "middle"}
        style={{ marginBottom: 24 }}
        vertical={isMobile}
        gap={isMobile ? 12 : 0}
      >
        <Title level={isMobile ? 5 : 4} style={{ margin: 0, color: "#dc2626" }}>
          Lengkapi Data Kepegawaian
        </Title>
        <Button
          type="primary"
          icon={<SyncOutlined />}
          loading={isUserInfoLoading}
          onClick={() => userInfo()}
          style={{
            backgroundColor: "#dc2626",
            borderColor: "#dc2626",
            borderRadius: 8,
          }}
          size={isMobile ? "middle" : "small"}
        >
          Refetch Data
        </Button>
      </Flex>

      {/* Data Pribadi (Read Only Display) */}
      <Card
        title={
          <Space>
            <UserOutlined style={{ color: "#dc2626" }} />
            <span>Data Pribadi</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
        size="small"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Flex vertical style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                NIP:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("nip")}
              </Text>
            </Flex>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Flex vertical style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                No KTP:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("no_ktp")}
              </Text>
            </Flex>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Flex vertical style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Nama:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("nama")}
              </Text>
            </Flex>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Flex vertical style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tempat Lahir:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("tempat_lahir")}
              </Text>
            </Flex>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Flex vertical style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tanggal Lahir:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("tgl_lahir")
                  ? dayjs(form.getFieldValue("tgl_lahir")).format("DD-MM-YYYY")
                  : "-"}
              </Text>
            </Flex>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Flex vertical style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Jenis Kelamin:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("jns_kelamin") === "L"
                  ? "Laki-laki"
                  : form.getFieldValue("jns_kelamin") === "P"
                  ? "Perempuan"
                  : "-"}
              </Text>
            </Flex>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Flex vertical style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                No HP:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("no_hp")}
              </Text>
            </Flex>
          </Col>
        </Row>
      </Card>

      {/* Data Kepegawaian (Editable Form Fields) */}
      <Card
        title={
          <Space>
            <BankOutlined style={{ color: "#dc2626" }} />
            <span>Data Kepegawaian</span>
          </Space>
        }
        size="small"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="tmt_pensiun"
              label="Usia Pensiun"
              rules={[
                { required: true, message: "Masukkan TMT Pensiun!" },
                {
                  validator: (_, value) => {
                    if (value > 70) {
                      return Promise.reject(
                        new Error(
                          "TMT Pensiun tidak boleh lebih dari 70 tahun!"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber style={{ width: "100%", borderRadius: 8 }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="norek_gaji"
              label="No Rek Gaji"
              rules={[
                {
                  pattern: /^[0-9]+$/,
                  message: "No Rek Gaji hanya boleh berisi angka!",
                },
              ]}
            >
              <Input style={{ borderRadius: 8 }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Flex vertical style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Kode Dinas:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("kd_dinas")}
              </Text>
            </Flex>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="nama_dinas"
              label="Nama Dinas"
              rules={[
                { required: true, message: "Masukkan Nama Dinas!" },
                { max: 100, message: "Nama Dinas maksimal 100 karakter!" },
              ]}
            >
              <Input.TextArea
                style={{ borderRadius: 8 }}
                maxLength={100}
                showCount
                placeholder="Masukkan nama dinas"
                rows={isMobile ? 2 : 3}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="alamat_kantor"
              label="Alamat Kantor"
              rules={[
                { required: true, message: "Alamat kantor wajib diisi!" },
                { min: 5, message: "Alamat kantor minimal 5 karakter!" },
              ]}
            >
              <Input
                style={{ borderRadius: 8 }}
                placeholder="Masukkan alamat kantor lengkap"
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="kode_kabkota"
              label="Kode Kabkota"
              rules={[{ required: true, message: "Kode kabkota wajib diisi!" }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                options={getKodeKabkota.map((item) => ({
                  label: item.label.replace("\r", ""),
                  value: item.key,
                }))}
                placeholder="Pilih kode kabkota"
                style={{ borderRadius: 8 }}
                notFoundContent="Kode kabkota tidak ditemukan"
                onChange={(value) => {
                  // Auto-fill kota kantor based on selected kode kabkota
                  const selectedKota = getKodeKabkota.find(
                    (item) => item.key === value
                  );
                  if (selectedKota) {
                    form.setFieldValue(
                      "kota_kantor",
                      selectedKota.label.replace("\r", "")
                    );
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Flex vertical style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Kota Kantor:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500, color: "#52c41a" }}>
                {form.getFieldValue("kota_kantor") ||
                  "Pilih kode kabkota terlebih dahulu"}
              </Text>
            </Flex>
          </Col>
        </Row>
      </Card>
    </Flex>
  );

  // Step 3: Review and Submit
  const renderStepThree = () => (
    <Flex vertical style={{ padding: isMobile ? "0 16px" : "0 20px" }}>
      <Title
        level={isMobile ? 5 : 4}
        style={{ marginBottom: 24, textAlign: "center", color: "#dc2626" }}
      >
        Review & Isi Data Kredit
      </Title>

      {/* Review Data Pribadi */}
      <Card
        title={
          <Space>
            <UserOutlined style={{ color: "#52c41a" }} />
            <span>Data Pribadi</span>
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
          </Space>
        }
        style={{ marginBottom: 16 }}
        size="small"
        bodyStyle={{ padding: 12 }}
      >
        <Row gutter={[8, 8]}>
          <Col xs={12} md={6}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              NIP:
            </Text>
            <Text style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
              {form.getFieldValue("nip")}
            </Text>
          </Col>
          <Col xs={12} md={6}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Nama:
            </Text>
            <Text style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
              {form.getFieldValue("nama")}
            </Text>
          </Col>
          <Col xs={12} md={6}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tempat Lahir:
            </Text>
            <Text style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
              {form.getFieldValue("tempat_lahir")}
            </Text>
          </Col>
          <Col xs={12} md={6}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              No HP:
            </Text>
            <Text style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
              {form.getFieldValue("no_hp")}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Review Data Kepegawaian */}
      <Card
        title={
          <Space>
            <BankOutlined style={{ color: "#52c41a" }} />
            <span>Data Kepegawaian</span>
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
          </Space>
        }
        style={{ marginBottom: 24 }}
        size="small"
        bodyStyle={{ padding: 12 }}
      >
        <Row gutter={[8, 8]}>
          <Col xs={12} md={6}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Usia Pensiun:
            </Text>
            <Text style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
              {form.getFieldValue("tmt_pensiun")} tahun
            </Text>
          </Col>
          <Col xs={12} md={6}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              No Rek Gaji:
            </Text>
            <Text style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
              {form.getFieldValue("norek_gaji") || "-"}
            </Text>
          </Col>
          <Col xs={24} md={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Nama Dinas:
            </Text>
            <Text style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
              {form.getFieldValue("nama_dinas")}
            </Text>
          </Col>
          <Col xs={24} md={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Alamat Kantor:
            </Text>
            <Text style={{ display: "block", fontSize: 13, fontWeight: 500 }}>
              {form.getFieldValue("alamat_kantor")}
            </Text>
          </Col>
          <Col xs={24} md={12}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Kota Kantor:
            </Text>
            <Text
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#52c41a",
              }}
            >
              {form.getFieldValue("kota_kantor")}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Data Kredit Form */}
      <Card
        title={
          <Space>
            <CreditCardOutlined style={{ color: "#dc2626" }} />
            <span style={{ color: "#dc2626", fontWeight: 600 }}>
              Data Kredit (Wajib Diisi)
            </span>
          </Space>
        }
        size="small"
      >
        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              name="jns_pinjaman"
              label="Jenis Pinjaman"
              rules={[{ required: true, message: "Pilih jenis pinjaman!" }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                options={getJenisKredit.map((item) => ({
                  label: item,
                  value: item,
                }))}
                placeholder="Pilih jenis kredit"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="plafon_pengajuan"
              label="Plafon Pengajuan"
              rules={[
                { required: true, message: "Masukkan plafon pengajuan!" },
              ]}
            >
              <InputNumber
                style={{ width: "100%", borderRadius: 8 }}
                formatter={(value) =>
                  `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/Rp\s?|(,*)/g, "")}
                placeholder="Masukkan jumlah pinjaman"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="jangka_waktu"
              label="Jangka Waktu (Bulan)"
              rules={[{ required: true, message: "Masukkan jangka waktu!" }]}
            >
              <InputNumber
                style={{ width: "100%", borderRadius: 8 }}
                min={1}
                max={300}
                placeholder="Masukkan jangka waktu dalam bulan"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </Flex>
  );

  return (
    <Flex justify="center" align={isMobile ? "flex-start" : "center"}>
      <Card
        style={{
          width: "100%",
          maxWidth: isMobile ? "100%" : "900px",
          borderRadius: isMobile ? 8 : 12,
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          margin: isMobile ? "8px 0" : "16px 0",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex vertical style={{ minHeight: isMobile ? "auto" : "600px" }}>
          {/* Header */}
          <Flex
            vertical
            align="center"
            justify="center"
            style={{
              background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
              color: "white",
              padding: isMobile ? "16px 20px" : "20px 24px",
              textAlign: "center",
            }}
          >
            <FileTextOutlined
              style={{ fontSize: isMobile ? 20 : 24, marginBottom: 8 }}
            />
            <Title
              level={isMobile ? 5 : 4}
              style={{ color: "white", margin: "0 0 4px 0" }}
            >
              Pengajuan Kredit
            </Title>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: isMobile ? 12 : 14,
              }}
            >
              Proses pengajuan kredit dalam 3 langkah mudah
            </Text>
          </Flex>

          {/* Steps */}
          <Flex
            justify="center"
            style={{
              padding: isMobile ? "16px 16px 12px 16px" : "24px 24px 16px 24px",
              background: "#fafafa",
            }}
          >
            <Steps
              current={currentStep}
              size={isMobile ? "small" : "default"}
              direction={isMobile ? "vertical" : "horizontal"}
              style={{ width: "100%" }}
              items={[
                {
                  title: "Ambil Data",
                  description: isMobile
                    ? null
                    : "Sinkronisasi data kepegawaian",
                  icon: <SyncOutlined />,
                },
                {
                  title: "Isi Form",
                  description: isMobile ? null : "Lengkapi data kepegawaian",
                  icon: <UserOutlined />,
                },
                {
                  title: "Submit",
                  description: isMobile ? null : "Review dan isi data kredit",
                  icon: <CreditCardOutlined />,
                },
              ]}
            />
          </Flex>

          {/* Form - Membungkus seluruh content */}
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* Hidden Form Fields - Always present in form */}
            {isSynced && (
              <Flex style={{ display: "none" }}>
                <Form.Item name="nip">
                  <Input />
                </Form.Item>
                <Form.Item name="no_ktp">
                  <Input />
                </Form.Item>
                <Form.Item name="nama">
                  <Input />
                </Form.Item>
                <Form.Item name="tempat_lahir">
                  <Input />
                </Form.Item>
                <Form.Item name="tgl_lahir">
                  <DatePicker />
                </Form.Item>
                <Form.Item name="jns_kelamin">
                  <Select />
                </Form.Item>
                <Form.Item name="no_hp">
                  <Input />
                </Form.Item>
                <Form.Item name="kd_dinas">
                  <Input />
                </Form.Item>
                <Form.Item name="nama_dinas">
                  <Input />
                </Form.Item>
                <Form.Item name="alamat_kantor">
                  <Input />
                </Form.Item>
                <Form.Item name="kota_kantor">
                  <Input />
                </Form.Item>
                <Form.Item name="kode_kabkota">
                  <Select />
                </Form.Item>
              </Flex>
            )}

            {/* Content */}
            <Flex
              vertical
              style={{
                flex: 1,
                padding: isMobile ? "16px 0" : "24px 0",
                background: "white",
                minHeight: "400px",
              }}
            >
              {currentStep === 0 && renderStepOne()}
              {currentStep === 1 && renderStepTwo()}
              {currentStep === 2 && renderStepThree()}
            </Flex>

            {/* Navigation */}
            <Flex
              justify="space-between"
              align="center"
              style={{
                padding: isMobile ? "12px 16px" : "16px 24px",
                borderTop: "1px solid #f0f0f0",
                background: "#fafafa",
              }}
            >
              <Flex>
                {currentStep > 0 && (
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={prevStep}
                    style={{ borderRadius: 8 }}
                    size={isMobile ? "middle" : "default"}
                  >
                    {isMobile ? "" : "Sebelumnya"}
                  </Button>
                )}
              </Flex>
              <Flex>
                {currentStep < 2 && isSynced && (
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={nextStep}
                    style={{
                      borderRadius: 8,
                      background:
                        "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                      border: "none",
                    }}
                    size={isMobile ? "middle" : "default"}
                  >
                    {isMobile ? "" : "Selanjutnya"}
                  </Button>
                )}
                {currentStep === 2 && (
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    style={{
                      borderRadius: 8,
                      background:
                        "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                      border: "none",
                      fontWeight: 600,
                      paddingLeft: isMobile ? 16 : 24,
                      paddingRight: isMobile ? 16 : 24,
                    }}
                    size={isMobile ? "middle" : "default"}
                  >
                    {isLoading
                      ? "Mengirim..."
                      : isMobile
                      ? "Submit"
                      : "Submit Pengajuan"}
                  </Button>
                )}
              </Flex>
            </Flex>
          </Form>
        </Flex>
      </Card>
    </Flex>
  );
};

export default FormPengajuanKredit;
