import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  Form,
  Input,
  DatePicker,
  Card,
  Select,
  InputNumber,
  Button,
  Steps,
  Typography,
  Space,
  Alert,
  Result,
  Divider,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  CarOutlined,
  HomeOutlined,
  DollarOutlined,
  BankOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { createStyles } from "antd-style";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const useStyle = createStyles(({ token, css }) => ({
  container: css`
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  `,
  stepCard: css`
    border-radius: 16px;
    border: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 24px;
    overflow: hidden;
  `,
  headerSection: css`
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    color: white;
    padding: 24px;
    text-align: center;
    position: relative;
  `,
  stepsContainer: css`
    background: white;
    padding: 24px 24px 16px 24px;
    border-bottom: 1px solid #f0f0f0;

    .ant-steps {
      margin-bottom: 0;
    }

    .ant-steps-item-finish .ant-steps-item-icon {
      background-color: #dc2626 !important;
      border-color: #dc2626 !important;
    }

    .ant-steps-item-process .ant-steps-item-icon {
      background-color: #dc2626 !important;
      border-color: #dc2626 !important;
    }

    .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
      color: white !important;
    }

    .ant-steps-item-process .ant-steps-item-icon > .ant-steps-icon {
      color: white !important;
    }
  `,
  formContainer: css`
    padding: 32px;
    background: white;
  `,
  formItemCustom: css`
    margin-bottom: 20px;
  `,
  inputCustom: css`
    border-radius: 8px !important;
    border: 1px solid #e2e8f0 !important;
    height: 44px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;

    &:hover,
    &:focus {
      border-color: #dc2626 !important;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1) !important;
    }
  `,
  selectCustom: css`
    .ant-select-selector {
      border-radius: 8px !important;
      border: 1px solid #e2e8f0 !important;
      height: 44px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    &:hover .ant-select-selector,
    &.ant-select-focused .ant-select-selector {
      border-color: #dc2626 !important;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1) !important;
    }

    .ant-select-item {
      padding: 6px 12px !important;
      min-height: auto !important;
      line-height: 1.2 !important;
    }

    .ant-select-item-option-content {
      flex: 1 !important;
    }
  `,
  buttonContainer: css`
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
  `,
  primaryButton: css`
    height: 44px !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%) !important;
    border: none !important;
    color: white !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    min-width: 120px !important;

    &:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3) !important;
      color: white !important;
    }
  `,
  secondaryButton: css`
    height: 44px !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    border: 1px solid #dc2626 !important;
    color: #dc2626 !important;
    background: white !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    min-width: 120px !important;

    &:hover {
      background: #dc2626 !important;
      color: white !important;
      transform: translateY(-1px) !important;
    }
  `,
  sectionTitle: css`
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  infoCard: css`
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  `,
  resultContainer: css`
    text-align: center;
    padding: 40px 20px;
  `,
  iconWrapper: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    margin-bottom: 16px;
    font-size: 24px;
  `,
}));

// Dummy data pegawai
const DUMMY_EMPLOYEE_DATA = {
  nip: "198501012010011001",
  nama: "Ahmad Suryanto, S.Kom",
  tempatLahir: "Surabaya",
  tanggalLahir: "1985-01-01",
  alamatKTP: "Jl. Pemuda No. 123, Surabaya, Jawa Timur 60271",
  alamatDomisili: "Jl. Diponegoro No. 456, Surabaya, Jawa Timur 60264",
  perangkatDaerah: "Badan Kepegawaian Daerah Provinsi Jawa Timur",
  email: "ahmad.suryanto@jatimprov.go.id",
  telepon: "081234567890",
  pangkatGolongan: "Penata Tk. I / III.d",
  jabatan: "Analis Kepegawaian Ahli Muda",
  gajiPokok: "Rp 3.044.300",
};

const JENIS_KREDIT_OPTIONS = [
  {
    value: "kkb",
    label: "Kredit Kendaraan Bermotor",
    icon: <CarOutlined />,
    description: "Pembiayaan untuk kendaraan bermotor",
  },
  {
    value: "kpr",
    label: "Kredit Pemilikan Rumah",
    icon: <HomeOutlined />,
    description: "Pembiayaan untuk kepemilikan rumah",
  },
  {
    value: "multiguna",
    label: "Kredit Multiguna",
    icon: <CreditCardOutlined />,
    description: "Pembiayaan untuk berbagai kebutuhan",
  },
];

function FormPengajuan({ step = 1, onStepChange }) {
  const [currentStep, setCurrentStep] = useState(step - 1); // 0-based index
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const { styles } = useStyle();
  const router = useRouter();

  const steps = [
    {
      title: "Informasi Pegawai",
      icon: <UserOutlined />,
      description: "Data pegawai otomatis",
    },
    {
      title: "Data Pinjaman",
      icon: <FileTextOutlined />,
      description: "Detail pengajuan kredit",
    },
    {
      title: "Hasil Pengajuan",
      icon: <CheckCircleOutlined />,
      description: "Status pengajuan",
    },
  ];

  const handleNext = async () => {
    try {
      if (currentStep === 1 || step === 2) {
        // Validate form sebelum submit
        const values = await form.validateFields();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
          // Random success/error for demo
          const isSuccess = Math.random() > 0.3; // 70% success rate
          setSubmitResult({
            success: isSuccess,
            nomorPengajuan: isSuccess
              ? `${values.jenisPengajuan.toUpperCase()}-2024-${String(
                  Math.floor(Math.random() * 999) + 1
                ).padStart(3, "0")}`
              : null,
            message: isSuccess
              ? "Pengajuan kredit Anda telah berhasil disubmit dan sedang dalam proses review."
              : "Maaf, pengajuan Anda tidak dapat diproses saat ini. Silakan periksa kembali data Anda atau hubungi customer service.",
            estimasiProses: isSuccess ? "7-14 hari kerja" : null,
          });
          setLoading(false);
          setCurrentStep(2);
          onStepChange?.(3);
        }, 2000);
      } else {
        setCurrentStep((prev) => prev + 1);
        onStepChange?.(currentStep + 2);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handlePrev = () => {
    if (step) {
      // Jika menggunakan step prop (halaman terpisah)
      if (step === 2) {
        // Dari data-pinjaman kembali ke pengajuan (step 1)
        router.push("/layanan-keuangan/bank-jatim/pengajuan");
      } else if (step === 3) {
        // Dari konfirmasi kembali ke data-pinjaman
        router.push("/layanan-keuangan/bank-jatim/pengajuan/data-pinjaman");
      }
    } else {
      // Multi-step form normal
      setCurrentStep((prev) => prev - 1);
      onStepChange?.(currentStep);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSubmitResult(null);
    form.resetFields();
    onStepChange?.(1);
  };

  // Step 1: Informasi Pegawai
  const renderStep1 = () => (
    <div>
      <div className={styles.sectionTitle}>
        <UserOutlined style={{ color: "#dc2626" }} />
        Informasi Pegawai (Otomatis)
      </div>

      <div className={styles.infoCard}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Space direction="vertical" size={0}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                NIP
              </Text>
              <Text strong>{DUMMY_EMPLOYEE_DATA.nip}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={0}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Nama Lengkap
              </Text>
              <Text strong>{DUMMY_EMPLOYEE_DATA.nama}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={0}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tempat, Tanggal Lahir
              </Text>
              <Text strong>
                {DUMMY_EMPLOYEE_DATA.tempatLahir},{" "}
                {DUMMY_EMPLOYEE_DATA.tanggalLahir}
              </Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={0}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Pangkat/Golongan
              </Text>
              <Text strong>{DUMMY_EMPLOYEE_DATA.pangkatGolongan}</Text>
            </Space>
          </Col>
          <Col span={24}>
            <Space direction="vertical" size={0}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Perangkat Daerah
              </Text>
              <Text strong>{DUMMY_EMPLOYEE_DATA.perangkatDaerah}</Text>
            </Space>
          </Col>
          <Col span={24}>
            <Space direction="vertical" size={0}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Alamat Sesuai KTP
              </Text>
              <Text strong>{DUMMY_EMPLOYEE_DATA.alamatKTP}</Text>
            </Space>
          </Col>
        </Row>
      </div>

      <Alert
        message="Informasi Otomatis"
        description="Data pegawai diambil secara otomatis dari sistem kepegawaian. Jika ada data yang tidak sesuai, silakan hubungi admin kepegawaian."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
    </div>
  );

  // Step 2: Data Pinjaman
  const renderStep2 = () => (
    <div>
      <div className={styles.sectionTitle}>
        <FileTextOutlined style={{ color: "#dc2626" }} />
        Data Pengajuan Pinjaman
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          ...DUMMY_EMPLOYEE_DATA,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              name="jenisPengajuan"
              label={<Text strong>Jenis Pengajuan Kredit</Text>}
              rules={[{ required: true, message: "Pilih jenis kredit" }]}
              className={styles.formItemCustom}
            >
              <Select
                className={styles.selectCustom}
                placeholder="Pilih jenis kredit yang akan diajukan"
                size="large"
                dropdownStyle={{ padding: "4px 0" }}
              >
                {JENIS_KREDIT_OPTIONS.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "2px 0",
                      }}
                    >
                      <span style={{ color: "#dc2626", fontSize: "14px" }}>
                        {option.icon}
                      </span>
                      <div style={{ lineHeight: "1.3" }}>
                        <div
                          style={{
                            fontWeight: "500",
                            marginBottom: "1px",
                            fontSize: "14px",
                          }}
                        >
                          {option.label}
                        </div>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: "11px",
                            lineHeight: "1.2",
                            display: "block",
                          }}
                        >
                          {option.description}
                        </Text>
                      </div>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="plafondPinjaman"
              label={<Text strong>Plafond Pinjaman</Text>}
              rules={[{ required: true, message: "Masukkan jumlah pinjaman" }]}
              className={styles.formItemCustom}
            >
              <InputNumber
                className={styles.inputCustom}
                style={{ width: "100%" }}
                placeholder="Masukkan jumlah pinjaman"
                formatter={(value) =>
                  `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/Rp\s?|(,*)/g, "")}
                min={5000000}
                max={2000000000}
                size="large"
                prefix={<DollarOutlined style={{ color: "#6b7280" }} />}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="jangkaWaktu"
              label={<Text strong>Jangka Waktu</Text>}
              rules={[{ required: true, message: "Pilih jangka waktu" }]}
              className={styles.formItemCustom}
            >
              <Select
                className={styles.selectCustom}
                placeholder="Pilih jangka waktu"
                size="large"
                dropdownStyle={{ padding: "4px 0" }}
              >
                <Select.Option value="12">12 Bulan</Select.Option>
                <Select.Option value="24">24 Bulan</Select.Option>
                <Select.Option value="36">36 Bulan</Select.Option>
                <Select.Option value="48">48 Bulan</Select.Option>
                <Select.Option value="60">60 Bulan</Select.Option>
                <Select.Option value="72">72 Bulan</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );

  // Step 3: Hasil
  const renderStep3 = () => (
    <div className={styles.resultContainer}>
      {submitResult?.success ? (
        <Result
          status="success"
          title="Pengajuan Berhasil Disubmit!"
          subTitle={
            <Space direction="vertical" size="small">
              <Text>
                Nomor Pengajuan:{" "}
                <Text strong>{submitResult.nomorPengajuan}</Text>
              </Text>
              <Text>{submitResult.message}</Text>
              <Text type="secondary">
                Estimasi proses: {submitResult.estimasiProses}
              </Text>
            </Space>
          }
          extra={[
            <Button
              key="new"
              className={styles.secondaryButton}
              onClick={handleReset}
            >
              Pengajuan Baru
            </Button>,
            <Button key="status" className={styles.primaryButton}>
              Cek Status
            </Button>,
          ]}
        />
      ) : (
        <Result
          status="error"
          title="Pengajuan Gagal"
          subTitle={submitResult?.message}
          extra={[
            <Button
              key="retry"
              className={styles.primaryButton}
              onClick={handlePrev}
            >
              Coba Lagi
            </Button>,
            <Button key="contact" className={styles.secondaryButton}>
              Hubungi CS
            </Button>,
          ]}
        />
      )}
    </div>
  );

  const renderStepContent = () => {
    // Jika step prop diberikan, tampilkan step spesifik (untuk penggunaan di halaman terpisah)
    if (step) {
      switch (step) {
        case 1:
          return renderStep1();
        case 2:
          return renderStep2();
        case 3:
          return renderStep3();
        default:
          return renderStep1();
      }
    }

    // Default behavior untuk multi-step form
    switch (currentStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.stepCard} bodyStyle={{ padding: 0 }}>
        {/* Header */}
        <div className={styles.headerSection}>
          <div className={styles.iconWrapper}>
            <BankOutlined />
          </div>
          <Title level={3} style={{ color: "white", margin: "0 0 8px 0" }}>
            Pengajuan Kredit Bank Jatim
          </Title>
          <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
            Lengkapi data pengajuan kredit Anda dengan mudah
          </Text>
        </div>

        {/* Steps Navigation */}
        <div className={styles.stepsContainer}>
          <Steps current={step ? step - 1 : currentStep} size="small">
            {steps.map((stepItem, index) => (
              <Step
                key={index}
                title={stepItem.title}
                description={stepItem.description}
                icon={stepItem.icon}
              />
            ))}
          </Steps>
        </div>

        {/* Form Content */}
        <div className={styles.formContainer}>
          {renderStepContent()}

          {/* Navigation Buttons */}
          {((step && step < 3) || (!step && currentStep < 2)) && (
            <div className={styles.buttonContainer}>
              <div>
                {((step && step > 1) || (!step && currentStep > 0)) && (
                  <Button
                    className={styles.secondaryButton}
                    onClick={handlePrev}
                    icon={<ArrowLeftOutlined />}
                  >
                    Sebelumnya
                  </Button>
                )}
              </div>
              <Button
                className={styles.primaryButton}
                onClick={handleNext}
                loading={loading}
                icon={
                  step === 2 || (!step && currentStep === 1) ? (
                    <FileTextOutlined />
                  ) : (
                    <ArrowRightOutlined />
                  )
                }
              >
                {step === 2 || (!step && currentStep === 1)
                  ? loading
                    ? "Memproses..."
                    : "Submit Pengajuan"
                  : "Selanjutnya"}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default FormPengajuan;
