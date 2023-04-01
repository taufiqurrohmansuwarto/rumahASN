import { Stack } from "@mantine/core";
import { Alert, Button, Col, Form, Input, Row, Select } from "antd";

function SIASNTracking() {
  const [form] = Form.useForm();

  const listLayanan = [
    "Kenaikan Pangkat",
    "Pemberhentian",
    //     "Pindah Instansi",
    "SKK",
  ];

  const handleFinish = async () => {
    try {
      const result = await form.validateFields();
      console.log(result);
    } catch (error) {}
  };

  return (
    <div>
      <Row>
        <Col md={18} xs={24}>
          <Stack>
            <Alert
              type="info"
              description="Halo! Segera kenali kemudahan dalam melakukan tracking layanan pada aplikasi SIASN! Dengan layanan integrasi yang kami sediakan, kamu dapat memantau setiap langkah layananmu dengan mudah dan cepat. Jangan sampai kehilangan kontrol atas layananmu, mari gunakan layanan integrasi SIASN kami!"
            />
            <Form onFinish={handleFinish} form={form} layout="vertical">
              <Form.Item
                rules={[
                  { required: true, message: "Pilih Layanan Terlebih dahulu" },
                ]}
                name="jenis_layanan"
                label="Jenis Layanan SIASN"
              >
                <Select
                  showSearch
                  allowClear
                  style={{
                    width: "100%",
                  }}
                >
                  {listLayanan.map((item) => (
                    <Select.Option key={item} name="item" value={item}>
                      {item}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                rules={[
                  { required: true, message: "NIP Pegawai tidak boleh kosong" },
                ]}
                name="nip"
                label="NIP Pegawai"
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit">Cari</Button>
              </Form.Item>
            </Form>
          </Stack>
        </Col>
      </Row>
    </div>
  );
}

export default SIASNTracking;
