import { pencarianLayananSIASN } from "@/services/index";
import { Stack } from "@mantine/core";
import { Alert, Button, Col, Form, Input, Modal, Row, Select } from "antd";
import { useState } from "react";

function SIASNTracking() {
  const [form] = Form.useForm();
  const [dataLayanan, setDataLayanan] = useState(null);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const cancelOpen = () => setOpen(false);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const listLayanan = [
    // "Kenaikan Pangkat",
    // "Pemberhentian",
    //     "Pindah Instansi",
    // "SKK",
    { key: "kenaikan-pangkat", label: "Kenaikan Pangkat" },
    { key: "pemberhentian", label: "Pemberhentian" },
    { key: "skk", label: "Status Kepegawaian Dan Kependudukan" },
  ];

  const handleFinish = async () => {
    try {
      const result = await form.validateFields();
      setDataLayanan(result);
      setLoading(true);
      const hasil = await pencarianLayananSIASN(result);
      setLoading(false);
      setOpen(true);
      console.log(hasil);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Row>
        <Modal
          title={`Layanan SIASN ${dataLayanan?.jenis_layanan} ${dataLayanan?.nip}`}
          onCancel={cancelOpen}
          open={open}
        >
          {result}
        </Modal>
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
                    <Select.Option
                      key={item?.key}
                      name="item"
                      value={item?.key}
                    >
                      {item?.label}
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
                <Button disabled={loading} loading={loading} htmlType="submit">
                  Cari
                </Button>
              </Form.Item>
            </Form>
          </Stack>
        </Col>
      </Row>
    </div>
  );
}

export default SIASNTracking;
