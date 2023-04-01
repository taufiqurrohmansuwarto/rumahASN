import { Stack } from "@mantine/core";
import { Alert, Button, Col, Form, Input, Row, Select } from "antd";

function SIMASTERTracking() {
  const [form] = Form.useForm();

  const listLayanan = [
    "Kenaikan Pangkat",
    "Jabatan Pelaksana",
    //     "Pindah Instansi",
    "Jabatan Fungsional",
    "Pensiun",
    "Ijin Belajar",
    "SK PNS",
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
              description="Halo! Kamu sering menggunakan aplikasi SIMASTER tapi kesulitan dalam melakukan tracking terhadap layananmu? Jangan khawatir, kini hadir layanan integrasi SIMASTER dari kami yang akan membuat tracking layananmu menjadi lebih mudah dan efisien! Dapatkan kontrol penuh atas layananmu dengan menggunakan layanan integrasi SIMASTER kami. Segera coba sekarang!"
            />
            <Form onFinish={handleFinish} form={form} layout="vertical">
              <Form.Item
                rules={[
                  { required: true, message: "Pilih Layanan Terlebih dahulu" },
                ]}
                name="jenis_layanan"
                label="Jenis Layanan SIMASTER"
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

export default SIMASTERTracking;
