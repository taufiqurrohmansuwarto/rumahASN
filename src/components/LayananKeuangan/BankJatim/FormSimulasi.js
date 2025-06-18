import {
  Form,
  InputNumber,
  Select,
  Button,
  message,
  Modal,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Descriptions,
} from "antd";
import { getJenisKredit, getKodeKabkota } from "@/utils/client-utils";
import { useMutation } from "@tanstack/react-query";
import { simulasiKredit } from "@/services/bankjatim.services";
import { createStyles } from "antd-style";
import {
  CalculatorOutlined,
  DollarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

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
}));

const FormSimulasi = () => {
  const [form] = Form.useForm();
  const { styles } = useStyle();

  const formatRupiah = (value) => {
    if (!value || isNaN(value)) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const { mutate, isLoading } = useMutation((data) => simulasiKredit(data), {
    onSuccess: (result) => {
      if (result?.data) {
        const {
          max_plafon,
          jangka_waktu,
          angsuran,
          bunga,
          tgl_jatuh_tempo,
          by_provinsi,
          by_admin,
          by_asuransi,
          by_blokir_angsuran,
          nominal_yg_diterima,
        } = result?.data;

        Modal.success({
          title: "Hasil Simulasi Kredit",
          width: 700,
          content: (
            <div style={{ padding: "16px 0" }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card
                    size="small"
                    title="Nominal yang Diterima"
                    bordered={false}
                    style={{
                      background: "#f6ffed",
                      borderLeft: "3px solid #52c41a",
                    }}
                  >
                    <Typography.Title
                      level={3}
                      style={{ margin: 0, color: "#52c41a" }}
                    >
                      {formatRupiah(nominal_yg_diterima)}
                    </Typography.Title>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Informasi Kredit" bordered={false}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Maksimal Plafon">
                        {formatRupiah(max_plafon)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Jangka Waktu">
                        {jangka_waktu ? `${jangka_waktu} bulan` : "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Angsuran per Bulan">
                        {formatRupiah(angsuran)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Bunga">
                        {formatRupiah(bunga)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tanggal Jatuh Tempo">
                        {tgl_jatuh_tempo || "-"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Biaya-biaya" bordered={false}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Biaya Provinsi">
                        {formatRupiah(by_provinsi)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Biaya Admin">
                        {formatRupiah(by_admin)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Biaya Asuransi">
                        {formatRupiah(by_asuransi)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Blokir Angsuran">
                        {formatRupiah(by_blokir_angsuran)}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>
            </div>
          ),
        });
      } else {
        Modal.error({
          title: "Simulasi Gagal",
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
        title: "Simulasi Gagal",
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

  const handleSubmit = async () => {
    const value = await form.validateFields();
    const payload = {
      ...value,
      kode_kabkota: `${value.kode_kabkota}`,
    };
    mutate(payload);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.statusCard} bodyStyle={{ padding: 0 }}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <div className={styles.iconWrapper}>
            <CalculatorOutlined />
          </div>
          <Title level={4} style={{ color: "white", margin: "0 0 4px 0" }}>
            Simulasi Kredit
          </Title>
          <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 13 }}>
            Hitung estimasi kredit yang Anda butuhkan
          </Text>
        </div>

        {/* Form Section */}
        <div className={styles.formContainer}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              className={styles.formItemCustom}
              name="gaji_pokok"
              label={<span className={styles.formLabel}>Gaji Pokok</span>}
              rules={[{ required: true, message: "Gaji Pokok harus diisi" }]}
              help={
                <div className={styles.formHelpText}>
                  Masukkan gaji pokok Anda dalam rupiah (contoh: 5000000)
                </div>
              }
            >
              <InputNumber
                className={styles.numberInputCustom}
                prefix={<DollarOutlined style={{ color: "#6b7280" }} />}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\Rp\s?|(,*)/g, "")}
                min={0}
                placeholder="Masukkan gaji pokok"
              />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="jangka_waktu"
              label={<span className={styles.formLabel}>Jangka Waktu</span>}
              rules={[{ required: true, message: "Jangka Waktu harus diisi" }]}
              help={
                <div className={styles.formHelpText}>
                  Pilih jangka waktu kredit dalam bulan (minimal 12 bulan,
                  maksimal 60 bulan)
                </div>
              }
            >
              <InputNumber
                className={styles.numberInputCustom}
                style={{ width: "100%" }}
                min={12}
                max={60}
                placeholder="Masukkan jangka waktu (12-60 bulan)"
                addonAfter="bulan"
              />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="jenis_kredit"
              label={<span className={styles.formLabel}>Jenis Kredit</span>}
              rules={[{ required: true, message: "Jenis Kredit harus diisi" }]}
              help={
                <div className={styles.formHelpText}>
                  Pilih jenis kredit yang sesuai dengan kebutuhan Anda
                </div>
              }
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
                notFoundContent="Jenis kredit tidak ditemukan"
              />
            </Form.Item>

            <Form.Item
              className={styles.formItemCustom}
              name="kode_kabkota"
              label={
                <span className={styles.formLabel}>Kode Kabupaten/Kota</span>
              }
              rules={[
                { required: true, message: "Kode Kabupaten/Kota harus diisi" },
              ]}
              help={
                <div className={styles.formHelpText}>
                  Pilih kabupaten/kota tempat Anda bekerja
                </div>
              }
            >
              <Select
                className={styles.selectCustom}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                options={getKodeKabkota.map((item) => ({
                  label: item.label.replace("\r", ""),
                  value: item.key,
                }))}
                placeholder="Pilih kabupaten/kota"
                notFoundContent="Kabupaten/kota tidak ditemukan"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className={styles.submitButton}
                icon={<CalculatorOutlined />}
              >
                {isLoading ? "Menghitung..." : "Hitung Simulasi"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default FormSimulasi;
