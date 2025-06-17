import { pengajuanKredit } from "@/services/bankjatim.services";
import { getJenisKredit, getKodeKabkota } from "@/utils/client-utils";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Typography,
} from "antd";
import { createStyles } from "antd-style";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const useStyle = createStyles(({ token, css }) => ({
  container: css`
    width: 100%;
    max-height: 70vh;
    overflow-y: auto;
  `,
  statusCard: css`
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    margin-bottom: 16px;
  `,
  headerSection: css`
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    color: white;
    padding: 20px 24px 16px 24px;
    text-align: center;
    position: relative;
    border-radius: 12px 12px 0 0;
  `,
  formContainer: css`
    padding: 24px;
    background: white;
  `,
  formItemCustom: css`
    margin-bottom: 16px;
  `,
  inputCustom: css`
    border-radius: 8px !important;
    border: 1px solid #e2e8f0 !important;
    height: 40px !important;
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
      height: 40px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    &:hover .ant-select-selector,
    &.ant-select-focused .ant-select-selector {
      border-color: #dc2626 !important;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1) !important;
    }
  `,
  numberInputCustom: css`
    .ant-input-number {
      border-radius: 8px !important;
      border: 1px solid #e2e8f0 !important;
      height: 40px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .ant-input-number:hover,
    .ant-input-number-focused {
      border-color: #dc2626 !important;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1) !important;
    }
  `,
  datePickerCustom: css`
    .ant-picker {
      border-radius: 8px !important;
      border: 1px solid #e2e8f0 !important;
      height: 40px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .ant-picker:hover,
    .ant-picker-focused {
      border-color: #dc2626 !important;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1) !important;
    }
  `,
  submitButton: css`
    width: 100% !important;
    height: 44px !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%) !important;
    border: none !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;

    &:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3) !important;
    }
  `,
  syncButton: css`
    width: 100% !important;
    height: 44px !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    background: #f3f4f6 !important;
    border: 1px solid #e2e8f0 !important;
    color: #1f2937 !important;
    margin-bottom: 16px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;

    &:hover {
      background: #e5e7eb !important;
      border-color: #dc2626 !important;
      color: #dc2626 !important;
    }
  `,
  iconWrapper: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    margin-bottom: 12px;
    font-size: 18px;
  `,
  formLabel: css`
    font-weight: 600 !important;
    font-size: 14px !important;
    color: #1f2937 !important;
  `,
  formHelpText: css`
    font-size: 12px;
    color: #6b7280;
    margin-top: 12px;
    margin-bottom: 12px;
  `,
  modalContent: css`
    .ant-modal-content {
      border-radius: 12px;
      overflow: hidden;
    }

    .ant-modal-header {
      background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
      border-bottom: none;
      padding: 20px 24px;
    }

    .ant-modal-title {
      color: white;
      font-size: 18px;
      font-weight: 600;
    }

    .ant-modal-close {
      color: white;
      top: 20px;
      right: 20px;
    }

    .ant-modal-body {
      padding: 24px;
    }

    .success-content {
      text-align: center;
      padding: 24px 0;
    }

    .success-icon {
      font-size: 48px;
      color: #10b981;
      margin-bottom: 16px;
    }

    .success-title {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .success-description {
      font-size: 14px;
      color: #6b7280;
    }

    .error-content {
      text-align: center;
      padding: 24px 0;
    }

    .error-icon {
      font-size: 48px;
      color: #ef4444;
      margin-bottom: 16px;
    }

    .error-title {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .error-description {
      font-size: 14px;
      color: #6b7280;
    }
  `,
}));

const INITIAL_DATA = {
  nip: "19910305201931008",
  no_ktp: "351515170503109",
  nama: "iput",
  tempat_lahir: "sidoarjo",
  tgl_lahir: "1991-03-05",
  jns_kelamin: "L",
  no_hp: "082132365897",
  tmt_pensiun: 58,
  norek_gaji: "000828485",
  kd_dinas: "123",
  nama_dinas: "badan kepegawaian daerah",
  alamat_kantor: "jl jemur andayani",
  kota_kantor: "surabaya",
  kode_kabkota: "3578",
  jns_pinjaman: "KMG",
  plafon_pengajuan: 100000000,
  jangka_waktu: 48,
};

const FormPengajuanKredit = () => {
  const [form] = Form.useForm();
  const { styles } = useStyle();

  const { mutate, isLoading } = useMutation((data) => pengajuanKredit(data), {
    onSuccess: (result) => {
      if (result?.data) {
        Modal.success({
          title: "Pengajuan Berhasil",
          width: 500,
          content: (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <CheckCircleOutlined
                style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }}
              />
              <Typography.Title level={4} style={{ marginBottom: 8 }}>
                Pengajuan Kredit Berhasil
              </Typography.Title>
              <Typography.Text type="secondary">
                Pengajuan kredit Anda telah berhasil disimpan. Silahkan tunggu
                informasi selanjutnya.
              </Typography.Text>
            </div>
          ),
        });
      } else {
        Modal.error({
          title: "Pengajuan Gagal",
          content: (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <CloseCircleOutlined
                style={{ fontSize: 48, color: "#ff4d4f", marginBottom: 16 }}
              />
              <Typography.Title level={4} style={{ marginBottom: 8 }}>
                Bank Jatim Error
              </Typography.Title>
              <Typography.Text type="secondary">
                {result?.response_description}
              </Typography.Text>
            </div>
          ),
        });
      }
    },
    onError: (error) => {
      Modal.error({
        title: "Pengajuan Gagal",
        content: (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CloseCircleOutlined
              style={{ fontSize: 48, color: "#ff4d4f", marginBottom: 16 }}
            />
            <Typography.Title level={4} style={{ marginBottom: 8 }}>
              Terjadi Kesalahan
            </Typography.Title>
            <Typography.Text type="secondary">
              {error.response.data.message}
            </Typography.Text>
          </div>
        ),
      });
    },
  });

  const handleSinkron = () => {
    form.setFieldsValue({
      ...INITIAL_DATA,
      tgl_lahir: dayjs(INITIAL_DATA.tgl_lahir),
    });
  };

  const handleSubmit = (data) => {
    const payload = {
      ...data,
      tgl_lahir: dayjs(data.tgl_lahir).format("YYYY-MM-DD"),
    };
    mutate(payload);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.statusCard} bodyStyle={{ padding: 0 }}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <div className={styles.iconWrapper}>
            <FileTextOutlined />
          </div>
          <Title level={4} style={{ color: "white", margin: "0 0 4px 0" }}>
            Pengajuan Kredit
          </Title>
          <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 13 }}>
            Isi formulir pengajuan kredit dengan lengkap
          </Text>
        </div>

        {/* Form Section */}
        <div className={styles.formContainer}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Button
              onClick={handleSinkron}
              className={styles.syncButton}
              icon={<SyncOutlined />}
            >
              Sinkron Data
            </Button>

            <Form.Item
              className={styles.formItemCustom}
              name="nip"
              label={<span className={styles.formLabel}>NIP</span>}
            >
              <Input className={styles.inputCustom} readOnly disabled />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="no_ktp"
              label={<span className={styles.formLabel}>No KTP</span>}
            >
              <Input className={styles.inputCustom} readOnly disabled />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="nama"
              label={<span className={styles.formLabel}>Nama</span>}
            >
              <Input className={styles.inputCustom} readOnly disabled />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="tempat_lahir"
              label={<span className={styles.formLabel}>Tempat Lahir</span>}
            >
              <Input className={styles.inputCustom} readOnly disabled />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="tgl_lahir"
              label={<span className={styles.formLabel}>Tanggal Lahir</span>}
            >
              <DatePicker
                className={styles.datePickerCustom}
                format="YYYY-MM-DD"
                readOnly
                disabled
              />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="jns_kelamin"
              label={<span className={styles.formLabel}>Jenis Kelamin</span>}
            >
              <Input className={styles.inputCustom} readOnly disabled />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="no_hp"
              label={<span className={styles.formLabel}>No HP</span>}
            >
              <Input className={styles.inputCustom} readOnly disabled />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="tmt_pensiun"
              label={<span className={styles.formLabel}>TMT Pensiun</span>}
            >
              <InputNumber
                className={styles.numberInputCustom}
                readOnly
                disabled
              />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="norek_gaji"
              label={<span className={styles.formLabel}>No Rek Gaji</span>}
            >
              <Input className={styles.inputCustom} readOnly disabled />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="kd_dinas"
              label={<span className={styles.formLabel}>Kode Dinas</span>}
            >
              <Input className={styles.inputCustom} readOnly disabled />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="nama_dinas"
              label={<span className={styles.formLabel}>Nama Dinas</span>}
            >
              <Input className={styles.inputCustom} readOnly disabled />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="alamat_kantor"
              label={<span className={styles.formLabel}>Alamat Kantor</span>}
            >
              <Input className={styles.inputCustom} readOnly disabled />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="kota_kantor"
              label={<span className={styles.formLabel}>Kota Kantor</span>}
            >
              <Input className={styles.inputCustom} disabled />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="kode_kabkota"
              label={<span className={styles.formLabel}>Kode Kabkota</span>}
            >
              <Select
                className={styles.selectCustom}
                disabled
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
              />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="jns_pinjaman"
              label={<span className={styles.formLabel}>Jenis Pinjaman</span>}
            >
              <Select
                className={styles.selectCustom}
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
              />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="plafon_pengajuan"
              label={<span className={styles.formLabel}>Plafon Pengajuan</span>}
            >
              <InputNumber className={styles.numberInputCustom} />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="jangka_waktu"
              label={<span className={styles.formLabel}>Jangka Waktu</span>}
            >
              <InputNumber className={styles.numberInputCustom} />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? "Mengirim..." : "Submit Pengajuan"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default FormPengajuanKredit;
