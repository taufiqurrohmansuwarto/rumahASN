import {
  Col,
  Row,
  Card,
  Form,
  InputNumber,
  Button,
  Select,
  Space,
  Descriptions,
  Divider,
  Statistic,
} from "antd";
import {
  CalculatorOutlined,
  FormOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const BankJatimSimulasiKPR = () => {
  const [form] = Form.useForm();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulasi = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/bank-jatim/simulasi/kpr", values);
      setResult(response.data);
    } catch (error) {
      message.error("Gagal melakukan simulasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row gutter={24}>
      <Col xs={24} lg={14}>
        <Card title="Parameter Simulasi">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSimulasi}
            initialValues={{
              jangkaWaktu: 180,
              sukuBunga: 6.5,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Harga Properti"
                  name="hargaProperti"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    size="large"
                    formatter={(value) =>
                      `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\Rp\s?|(,*)/g, "")}
                    placeholder="500.000.000"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Uang Muka (DP)"
                  name="uangMuka"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    size="large"
                    formatter={(value) =>
                      `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\Rp\s?|(,*)/g, "")}
                    placeholder="50.000.000"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Jangka Waktu (Bulan)" name="jangkaWaktu">
                  <Select size="large">
                    <Option value={60}>5 Tahun (60 Bulan)</Option>
                    <Option value={120}>10 Tahun (120 Bulan)</Option>
                    <Option value={180}>15 Tahun (180 Bulan)</Option>
                    <Option value={240}>20 Tahun (240 Bulan)</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Suku Bunga (%/tahun)" name="sukuBunga">
                  <InputNumber
                    style={{ width: "100%" }}
                    size="large"
                    min={0}
                    max={20}
                    step={0.1}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value.replace("%", "")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              icon={<CalculatorOutlined />}
            >
              Hitung Simulasi
            </Button>
          </Form>
        </Card>
      </Col>

      <Col xs={24} lg={10}>
        {result && (
          <Card title="Hasil Simulasi" className="result-card">
            <Statistic
              title="Angsuran per Bulan"
              value={result.angsuranBulanan}
              precision={0}
              prefix="Rp"
              valueStyle={{ color: "#3f8600", fontSize: 32 }}
            />

            <Divider />

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Pokok Pinjaman">
                {formatRupiah(result.pokokPinjaman)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Bunga">
                {formatRupiah(result.totalBunga)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Pembayaran">
                {formatRupiah(result.totalPembayaran)}
              </Descriptions.Item>
            </Descriptions>

            <Space
              direction="vertical"
              style={{ width: "100%", marginTop: 24 }}
            >
              <Button
                type="primary"
                block
                icon={<FormOutlined />}
                onClick={() =>
                  router.push("/layanan-bank/bank-jatim/pengajuan?type=kpr")
                }
              >
                Ajukan KPR Sekarang
              </Button>

              <Button
                block
                icon={<DownloadOutlined />}
                onClick={() => downloadSimulasi(result)}
              >
                Download Hasil Simulasi
              </Button>
            </Space>
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default BankJatimSimulasiKPR;
