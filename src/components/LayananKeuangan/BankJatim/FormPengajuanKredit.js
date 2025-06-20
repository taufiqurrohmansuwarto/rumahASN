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
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";

const { Title, Text } = Typography;

const FormPengajuanKredit = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSynced, setIsSynced] = useState(false);

  const { mutate: userInfo, isLoading: isUserInfoLoading } = useMutation({
    mutationFn: getUserInfo,
    onSuccess: (result) => {
      form.setFieldsValue({
        ...result,
        tgl_lahir: dayjs(result.tgl_lahir),
      });
      setIsSynced(true);
      setCurrentStep(1); // Auto move to next step
    },
  });

  const { mutate, isLoading } = useMutation((data) => pengajuanKredit(data), {
    onSuccess: (result) => {
      if (result?.data) {
        const { no_pengajuan, kantor_cabang } = result?.data;
        Modal.success({
          title: "Pengajuan Berhasil Disubmit",
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
          "alamat_kantor",
          "kode_kabkota",
        ]);
        setCurrentStep(currentStep + 1);
      } catch (error) {
        // Form validation failed, don't move to next step
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
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <SyncOutlined
        style={{
          fontSize: 48,
          color: isSynced ? "#52c41a" : "#dc2626",
          marginBottom: 20,
        }}
      />
      <Title level={3} style={{ marginBottom: 16 }}>
        {isSynced ? "Data Berhasil Diambil" : "Ambil Data Kepegawaian"}
      </Title>
      <Text
        type="secondary"
        style={{ fontSize: 16, display: "block", marginBottom: 32 }}
      >
        {isSynced
          ? "Data kepegawaian Anda telah berhasil diambil dari sistem SIASN"
          : "Klik tombol di bawah untuk mengambil data kepegawaian dari sistem SIASN"}
      </Text>

      {!isSynced && (
        <Button
          type="primary"
          size="large"
          icon={<SyncOutlined />}
          loading={isUserInfoLoading}
          onClick={() => userInfo()}
          style={{
            height: 48,
            paddingLeft: 24,
            paddingRight: 24,
            borderRadius: 8,
            background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
            border: "none",
            fontWeight: 600,
          }}
        >
          {isUserInfoLoading ? "Mengambil Data..." : "Ambil Data Kepegawaian"}
        </Button>
      )}
    </div>
  );

  // Step 2: Form Input (except credit data)
  const renderStepTwo = () => (
    <div style={{ padding: "0 20px" }}>
      <Title
        level={4}
        style={{ marginBottom: 24, textAlign: "center", color: "#dc2626" }}
      >
        Lengkapi Data Kepegawaian
      </Title>

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
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                NIP:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("nip")}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                No KTP:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("no_ktp")}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                Nama:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("nama")}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                Tempat Lahir:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("tempat_lahir")}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                Tanggal Lahir:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("tgl_lahir")
                  ? dayjs(form.getFieldValue("tgl_lahir")).format("DD-MM-YYYY")
                  : "-"}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                Jenis Kelamin:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("jns_kelamin") === "L"
                  ? "Laki-laki"
                  : form.getFieldValue("jns_kelamin") === "P"
                  ? "Perempuan"
                  : "-"}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                No HP:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("no_hp")}
              </Text>
            </div>
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
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="tmt_pensiun"
              label="TMT Pensiun"
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
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                Kode Dinas:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("kd_dinas")}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                Nama Dinas:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: 500 }}>
                {form.getFieldValue("nama_dinas")}
              </Text>
            </div>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="alamat_kantor"
              label="Alamat Kantor"
              rules={[{ required: true, message: "Masukkan Alamat Kantor!" }]}
            >
              <Input style={{ borderRadius: 8 }} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="kode_kabkota"
              label="Kode Kabkota"
              rules={[{ required: true, message: "Pilih kode kabkota!" }]}
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
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </div>
  );

  // Step 3: Review and Submit
  const renderStepThree = () => (
    <div style={{ padding: "0 20px" }}>
      <Title
        level={4}
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
              TMT Pensiun:
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
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Card
        style={{
          flex: 1,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 0, height: "100%" }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
            color: "white",
            padding: "20px 24px",
            textAlign: "center",
          }}
        >
          <FileTextOutlined style={{ fontSize: 24, marginBottom: 8 }} />
          <Title level={4} style={{ color: "white", margin: "0 0 4px 0" }}>
            Pengajuan Kredit
          </Title>
          <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
            Proses pengajuan kredit dalam 3 langkah mudah
          </Text>
        </div>

        {/* Steps */}
        <div style={{ padding: "24px 24px 16px 24px", background: "#fafafa" }}>
          <Steps
            current={currentStep}
            size="small"
            items={[
              {
                title: "Ambil Data",
                description: "Sinkronisasi data kepegawaian",
                icon: <SyncOutlined />,
              },
              {
                title: "Isi Form",
                description: "Lengkapi data kepegawaian",
                icon: <UserOutlined />,
              },
              {
                title: "Submit",
                description: "Review dan isi data kredit",
                icon: <CreditCardOutlined />,
              },
            ]}
          />
        </div>

        {/* Form - Membungkus seluruh content */}
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Hidden Form Fields - Always present in form */}
          {isSynced && (
            <div style={{ display: "none" }}>
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
            </div>
          )}

          {/* Content */}
          <div
            style={{
              flex: 1,
              padding: "24px 0",
              overflowY: "auto",
              background: "white",
            }}
          >
            {currentStep === 0 && renderStepOne()}
            {currentStep === 1 && renderStepTwo()}
            {currentStep === 2 && renderStepThree()}
          </div>

          {/* Navigation */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #f0f0f0",
              background: "#fafafa",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                {currentStep > 0 && (
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={prevStep}
                    style={{ borderRadius: 8 }}
                  >
                    Sebelumnya
                  </Button>
                )}
              </div>
              <div>
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
                  >
                    Selanjutnya
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
                      paddingLeft: 24,
                      paddingRight: 24,
                    }}
                  >
                    {isLoading ? "Mengirim..." : "Submit Pengajuan"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default FormPengajuanKredit;
