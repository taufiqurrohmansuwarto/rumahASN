import {
  Form,
  Input,
  Modal,
  DatePicker,
  Select,
  Row,
  Col,
  Divider,
  Typography,
} from "antd";

const { Text } = Typography;

function FormTugasBelajar({ open, onCancel, onFinish }) {
  const [form] = Form.useForm();

  const handleFinish = () => {
    onFinish();
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      centered
      width={900}
      open={open}
      onCancel={onCancel}
      title="Form Tugas Belajar"
      okText="Simpan"
      okButtonProps={{
        type: "primary",
      }}
      cancelText="Batal"
      cancelButtonProps={{
        type: "default",
      }}
      onOk={handleFinish}
      bodyStyle={{
        maxHeight: "70vh",
        overflowY: "auto",
        overflowX: "hidden",
        paddingRight: "6px",
      }}
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        {/* Informasi Gelar */}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 16 }}>
            📚 Informasi Gelar
          </Text>
          <Text
            type="secondary"
            style={{ display: "block", fontSize: 12, marginTop: 4 }}
          >
            Isi gelar akademik yang akan diperoleh
          </Text>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Gelar Depan"
              name="gelarDepan"
              tooltip="Contoh: Dr., Prof., Ir."
            >
              <Input placeholder="Dr., Prof., Ir." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Gelar Belakang"
              name="gelarBelakang"
              tooltip="Contoh: S.Kom., M.T., Ph.D"
            >
              <Input placeholder="S.Kom., M.T., Ph.D" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* Informasi Institusi */}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 16 }}>
            🏫 Informasi Institusi Pendidikan
          </Text>
          <Text
            type="secondary"
            style={{ display: "block", fontSize: 12, marginTop: 4 }}
          >
            Detail tentang institusi tempat tugas belajar
          </Text>
        </div>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Nama Sekolah/Universitas"
              name="namaSekolah"
              tooltip="Nama lengkap institusi pendidikan"
            >
              <Input placeholder="Universitas Indonesia, Institut Teknologi Bandung, dll" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="No Akreditasi Jurusan"
              name="noAkreditasiJurusan"
              tooltip="Nomor sertifikat akreditasi program studi"
            >
              <Input placeholder="123/SK/BAN-PT/Akred/S/2023" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Predikat Akreditasi"
              name="predikatAkreditasiJurusan"
              tooltip="Tingkat akreditasi program studi"
            >
              <Select placeholder="Pilih predikat akreditasi">
                <Select.Option value="A">A (Sangat Baik)</Select.Option>
                <Select.Option value="B">B (Baik)</Select.Option>
                <Select.Option value="C">C (Cukup)</Select.Option>
                <Select.Option value="Unggul">Unggul</Select.Option>
                <Select.Option value="Baik Sekali">Baik Sekali</Select.Option>
                <Select.Option value="Baik">Baik</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* Informasi Referensi */}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 16 }}>
            🔗 Informasi Referensi
          </Text>
          <Text
            type="secondary"
            style={{ display: "block", fontSize: 12, marginTop: 4 }}
          >
            ID referensi sistem untuk kategori pendidikan
          </Text>
        </div>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Pendidikan ID"
              name="pendidikanId"
              tooltip="ID referensi jenjang pendidikan"
            >
              <Input placeholder="Kode pendidikan" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="TK Pendidikan ID"
              name="tkPendidikanId"
              tooltip="ID tingkat pendidikan"
            >
              <Input placeholder="Kode tingkat" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Jenis Tubel ID"
              name="refJenisTubelId"
              tooltip="ID jenis tugas belajar"
            >
              <Input placeholder="Kode jenis tubel" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* Periode Waktu */}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 16 }}>
            📅 Periode Tugas Belajar
          </Text>
          <Text
            type="secondary"
            style={{ display: "block", fontSize: 12, marginTop: 4 }}
          >
            Tentukan periode waktu pelaksanaan tugas belajar
          </Text>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tanggal Mulai"
              name="tglMulai"
              tooltip="Tanggal dimulainya tugas belajar"
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Pilih tanggal mulai"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tanggal Selesai"
              name="tglSelesai"
              tooltip="Tanggal berakhirnya tugas belajar"
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Pilih tanggal selesai"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default FormTugasBelajar;
