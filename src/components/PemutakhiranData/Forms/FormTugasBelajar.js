import {
  Form,
  Input,
  Modal,
  DatePicker,
  Select,
  Row,
  Col,
  Button,
  Collapse,
} from "antd";
import { Text, Stack, Flex } from "@mantine/core";
import {
  IconSchool,
  IconCertificate,
  IconCalendar,
  IconId,
  IconBook,
  IconAward,
  IconFileText,
  IconHash,
} from "@tabler/icons-react";

function FormTugasBelajar({ open, onCancel, onFinish }) {
  const [form] = Form.useForm();

  const handleFinish = () => {
    onFinish();
    form.resetFields();
    onCancel();
  };

  const collapseItems = [
    {
      key: "referensi",
      label: (
        <Flex align="center" gap={6}>
          <IconId size={14} />
          <Text size="xs" fw={500}>
            Referensi ID
          </Text>
        </Flex>
      ),
      children: (
        <Row gutter={[12, 8]}>
          <Col span={8}>
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Pendidikan ID
            </Text>
            <Form.Item name="pendidikanId" style={{ marginBottom: 0 }}>
              <Input
                size="small"
                placeholder="Kode pendidikan"
                prefix={<IconHash size={14} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              TK Pendidikan ID
            </Text>
            <Form.Item name="tkPendidikanId" style={{ marginBottom: 0 }}>
              <Input
                size="small"
                placeholder="Kode tingkat"
                prefix={<IconHash size={14} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Jenis Tubel ID
            </Text>
            <Form.Item name="refJenisTubelId" style={{ marginBottom: 0 }}>
              <Input
                size="small"
                placeholder="Kode jenis tubel"
                prefix={<IconHash size={14} />}
              />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <Modal
      centered
      width={700}
      open={open}
      onCancel={onCancel}
      title={
        <Flex align="center" gap={8}>
          <IconBook size={18} />
          <Text size="sm" fw={600}>
            Form Tugas Belajar
          </Text>
        </Flex>
      }
      footer={
        <Flex justify="end" gap={8}>
          <Button onClick={onCancel}>Batal</Button>
          <Button type="primary" onClick={handleFinish}>
            Simpan
          </Button>
        </Flex>
      }
    >
      <Form form={form} onFinish={onFinish} layout="vertical" size="small">
        <Stack spacing={12}>
          {/* Gelar */}
          <div>
            <Flex align="center" gap={6} mb={8}>
              <IconAward size={14} />
              <Text size="xs" fw={600}>
                Gelar
              </Text>
            </Flex>
            <Row gutter={[12, 8]}>
              <Col span={12}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Gelar Depan
                </Text>
                <Form.Item name="gelarDepan" style={{ marginBottom: 0 }}>
                  <Input
                    size="small"
                    placeholder="Dr., Prof., Ir."
                    prefix={<IconCertificate size={14} />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Gelar Belakang
                </Text>
                <Form.Item name="gelarBelakang" style={{ marginBottom: 0 }}>
                  <Input
                    size="small"
                    placeholder="S.Kom., M.T., Ph.D"
                    prefix={<IconCertificate size={14} />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Institusi */}
          <div>
            <Flex align="center" gap={6} mb={8}>
              <IconSchool size={14} />
              <Text size="xs" fw={600}>
                Institusi Pendidikan
              </Text>
            </Flex>
            <Row gutter={[12, 8]}>
              <Col span={24}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Nama Sekolah/Universitas
                </Text>
                <Form.Item name="namaSekolah" style={{ marginBottom: 0 }}>
                  <Input
                    size="small"
                    placeholder="Universitas Indonesia, ITB, dll"
                    prefix={<IconSchool size={14} />}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[12, 8]} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  No Akreditasi
                </Text>
                <Form.Item
                  name="noAkreditasiJurusan"
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    size="small"
                    placeholder="123/SK/BAN-PT/..."
                    prefix={<IconFileText size={14} />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Predikat Akreditasi
                </Text>
                <Form.Item
                  name="predikatAkreditasiJurusan"
                  style={{ marginBottom: 0 }}
                >
                  <Select size="small" placeholder="Pilih predikat">
                    <Select.Option value="A">A (Sangat Baik)</Select.Option>
                    <Select.Option value="B">B (Baik)</Select.Option>
                    <Select.Option value="C">C (Cukup)</Select.Option>
                    <Select.Option value="Unggul">Unggul</Select.Option>
                    <Select.Option value="Baik Sekali">
                      Baik Sekali
                    </Select.Option>
                    <Select.Option value="Baik">Baik</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Periode */}
          <div>
            <Flex align="center" gap={6} mb={8}>
              <IconCalendar size={14} />
              <Text size="xs" fw={600}>
                Periode Tugas Belajar
              </Text>
            </Flex>
            <Row gutter={[12, 8]}>
              <Col span={12}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Tanggal Mulai
                </Text>
                <Form.Item name="tglMulai" style={{ marginBottom: 0 }}>
                  <DatePicker
                    size="small"
                    style={{ width: "100%" }}
                    placeholder="Pilih tanggal"
                    format="DD-MM-YYYY"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Tanggal Selesai
                </Text>
                <Form.Item name="tglSelesai" style={{ marginBottom: 0 }}>
                  <DatePicker
                    size="small"
                    style={{ width: "100%" }}
                    placeholder="Pilih tanggal"
                    format="DD-MM-YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Referensi ID - Collapse */}
          <Collapse
            size="small"
            items={collapseItems}
            bordered={false}
            style={{ background: "transparent" }}
          />
        </Stack>
      </Form>
    </Modal>
  );
}

export default FormTugasBelajar;
