import { cekPeminjamanKredit } from "@/services/bankjatim.services";
import {
  Form,
  Input,
  Button,
  Modal,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Descriptions,
  Badge,
} from "antd";
import { useMutation } from "@tanstack/react-query";
import { createStyles } from "antd-style";
import {
  SearchOutlined,
  FileTextOutlined,
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

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .info-item {
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      border-left: 3px solid #dc2626;
    }

    .info-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .info-value {
      font-size: 14px;
      color: #1f2937;
      font-weight: 500;
    }
  `,
}));

const FormCekPengajuanKredit = () => {
  const [form] = Form.useForm();
  const { styles } = useStyle();

  const { mutate, isLoading } = useMutation(
    (data) => cekPeminjamanKredit(data),
    {
      onSuccess: (result) => {
        if (result?.data) {
          const {
            nip,
            no_ktp,
            nama,
            jns_kelamin,
            no_hp,
            kd_dinas,
            tmt_pensiun,
            norek_gaji,
            alamat_kantor,
            nama_dinas,
            kota_kantor,
            kode_kabkota,
            status_pengajuan,
            keterangan,
          } = result?.data;

          Modal.success({
            title: "Status Pengajuan Kredit",
            width: 600,
            content: (
              <div style={{ padding: "16px 0" }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card size="small" title="Data Pribadi" bordered={false}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="NIP">{nip}</Descriptions.Item>
                        <Descriptions.Item label="No KTP">
                          {no_ktp}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nama">
                          {nama}
                        </Descriptions.Item>
                        <Descriptions.Item label="Jenis Kelamin">
                          {jns_kelamin}
                        </Descriptions.Item>
                        <Descriptions.Item label="No HP">
                          {no_hp}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" title="Data Kantor" bordered={false}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Kode Dinas">
                          {kd_dinas}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nama Dinas">
                          {nama_dinas}
                        </Descriptions.Item>
                        <Descriptions.Item label="Alamat Kantor">
                          {alamat_kantor}
                        </Descriptions.Item>
                        <Descriptions.Item label="Kota">
                          {kota_kantor}
                        </Descriptions.Item>
                        <Descriptions.Item label="Kode Kabkota">
                          {kode_kabkota}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card
                      size="small"
                      title="Status Pengajuan"
                      bordered={false}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Badge
                          status={
                            status_pengajuan === "DITERIMA"
                              ? "success"
                              : "error"
                          }
                          text={status_pengajuan}
                          style={{ fontSize: "16px", fontWeight: "bold" }}
                        />
                        <Typography.Text type="secondary">
                          {keterangan}
                        </Typography.Text>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          });
        } else {
          Modal.error({
            title: "Pengajuan Tidak Ditemukan",
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
          title: "Terjadi Kesalahan",
          content: (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <CloseCircleOutlined
                style={{ fontSize: 48, color: "#ff4d4f", marginBottom: 16 }}
              />
              <Typography.Title level={4} style={{ marginBottom: 8 }}>
                Gagal Memeriksa Status
              </Typography.Title>
              <Typography.Text type="secondary">
                {error.response.data.message}
              </Typography.Text>
            </div>
          ),
        });
      },
    }
  );

  const handleSubmit = async () => {
    const value = await form.validateFields();
    mutate(value);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.statusCard} bodyStyle={{ padding: 0 }}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <div className={styles.iconWrapper}>
            <SearchOutlined />
          </div>
          <Title level={4} style={{ color: "white", margin: "0 0 4px 0" }}>
            Cek Pengajuan Kredit
          </Title>
          <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 13 }}>
            Masukkan nomor pengajuan untuk melihat status
          </Text>
        </div>

        {/* Form Section */}
        <div className={styles.formContainer}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              className={styles.formItemCustom}
              name="no_pengajuan"
              label={<span className={styles.formLabel}>No Pengajuan</span>}
              rules={[{ required: true, message: "No Pengajuan harus diisi" }]}
              help={
                <div className={styles.formHelpText}>
                  Masukkan nomor pengajuan kredit Anda
                </div>
              }
            >
              <Input
                className={styles.inputCustom}
                placeholder="Masukkan nomor pengajuan"
                prefix={<FileTextOutlined style={{ color: "#6b7280" }} />}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, marginTop: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className={styles.submitButton}
                icon={<SearchOutlined />}
              >
                {isLoading ? "Mencari..." : "Cek Pengajuan"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default FormCekPengajuanKredit;
