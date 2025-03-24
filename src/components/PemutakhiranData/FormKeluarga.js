import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
} from "antd";
import { useEffect, useState } from "react";

const jenisIdentitas = [
  { id: "1", label: "KTP/KIA", value: "1" },
  { id: "2", label: "Passport", value: "2" },
];

const agama = [
  { id: "1", name: "Islam" },
  { id: "2", name: "Kristen" },
  { id: "3", name: "Katolik" },
  { id: "4", name: "Hindu" },
  { id: "5", name: "Budha" },
  { id: "6", name: "Konghucu" },
  { id: "7", name: "Lainnya" },
];

const statusNikah = [
  { id: "1", name: "Menikah" },
  { id: "2", name: "Cerai Hidup" },
];

/**
 * Komponen modal form untuk menambah atau mengedit data pasangan
 * @param {Object} props - Props komponen
 * @param {boolean} props.open - Status modal terbuka atau tertutup
 * @param {Function} props.onCancel - Fungsi yang dipanggil saat modal dibatalkan
 * @param {Object} props.initalValue - Data awal pasangan dengan properti berikut:
 * @param {string} props.initalValue.agamaId - ID agama pasangan
 * @param {string} props.initalValue.alamat - Alamat pasangan
 * @param {string} props.initalValue.email - Email pasangan
 * @param {string} props.initalValue.id - ID pasangan
 * @param {string} props.initalValue.jenisIdentitas - Jenis identitas pasangan
 * @param {string} props.initalValue.nama - Nama pasangan
 * @param {string} props.initalValue.noAktaCerai - Nomor akta cerai
 * @param {string} props.initalValue.noAktaMenikah - Nomor akta menikah
 * @param {string} props.initalValue.noAktaMeninggal - Nomor akta meninggal
 * @param {string} props.initalValue.noHp - Nomor HP pasangan
 * @param {string} props.initalValue.nomorIdentitas - Nomor identitas pasangan
 * @param {number} props.initalValue.pasanganKe - Urutan pasangan
 * @param {string} props.initalValue.pnsOrangId - ID PNS
 * @param {string} props.initalValue.statusHidup - Status hidup pasangan
 * @param {string} props.initalValue.statusPekerjaanPasangan - Status pekerjaan pasangan
 * @param {string} props.initalValue.statusPernikahan - Status pernikahan
 * @param {string} props.initalValue.tglAktaMenikah - Tanggal akta menikah
 * @param {string} props.initalValue.tglLahir - Tanggal lahir pasangan
 * @returns {JSX.Element} Komponen modal form pasangan
 */

const formatTanggal = "DD-MM-YYYY";

const ModalFormKeluarga = ({ open, onCancel, initalValue }) => {
  const [form] = Form.useForm();
  const [statusPekerjaan, setStatusPekerjaan] = useState(null);
  const [statusPernikahan, setStatusPernikahan] = useState(null);
  const [statusHidup, setStatusHidup] = useState(null);

  // Mengatur nilai awal form ketika data tersedia
  useEffect(() => {
    if (initalValue) {
      form.setFieldsValue(initalValue);
      setStatusPekerjaan(initalValue.statusPekerjaan);
      setStatusPernikahan(initalValue.statusPernikahan);
      setStatusHidup(initalValue.statusHidup);
    }
  }, [initalValue, form]);

  // Handler untuk perubahan status
  const handleStatusPekerjaanChange = (e) => setStatusPekerjaan(e.target.value);
  const handleStatusPernikahanChange = (e) =>
    setStatusPernikahan(e.target.value);
  const handleStatusHidupChange = (e) => setStatusHidup(e.target.value);

  // Render komponen form untuk ASN
  const renderAsnForm = () => (
    <>
      {/* Informasi Pernikahan untuk ASN */}
      <Form.Item name="statusPernikahan" label="Status Pernikahan">
        <Radio.Group onChange={handleStatusPernikahanChange}>
          {statusNikah.map((item) => (
            <Radio.Button key={item.id} value={item.id}>
              {item.name}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Form.Item>

      {/* Form untuk status menikah */}
      {statusPernikahan === "1" && (
        <Row gutter={[16, 0]}>
          <Col span={12}>
            <Form.Item name="noAktaMenikah" label="No Akta Menikah">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tglMenikah" label="Tanggal Menikah">
              <DatePicker format={formatTanggal} />
            </Form.Item>
          </Col>
        </Row>
      )}

      {/* Form untuk status cerai hidup */}
      {statusPernikahan === "2" && (
        <Row gutter={[16, 0]}>
          <Col span={12}>
            <Form.Item name="tglMenikah" label="Tanggal Menikah">
              <DatePicker format={formatTanggal} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="noAktaCerai" label="No Akta Cerai">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      )}
    </>
  );

  // Render komponen form untuk Non ASN
  const renderNonAsnForm = () => (
    <>
      {/* Data Pribadi Pasangan */}
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <Form.Item name="nama" label="Nama">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="tglLahir" label="Tanggal Lahir">
            <DatePicker format={formatTanggal} />
          </Form.Item>
        </Col>
      </Row>

      {/* Identitas Pasangan */}
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <Form.Item name="jenisIdentitas" label="Jenis Identitas">
            <Radio.Group>
              {jenisIdentitas.map((item) => (
                <Radio.Button key={item.value} value={item.value}>
                  {item.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="nomorIdentitas" label="Nomor Identitas">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      {/* Informasi Agama dan Status Hidup */}
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <Form.Item name="agamaId" label="Agama">
            <Select showSearch optionFilterProp="children" allowClear>
              {agama.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="statusHidup" label="Status Hidup">
            <Radio.Group onChange={handleStatusHidupChange}>
              <Radio.Button value={1}>Hidup</Radio.Button>
              <Radio.Button value={0}>Meninggal</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      {/* Alamat */}
      <Row gutter={[16, 0]}>
        <Col span={24}>
          <Form.Item name="alamat" label="Alamat">
            <Input.TextArea />
          </Form.Item>
        </Col>
      </Row>

      {/* Kontak Pasangan */}
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <Form.Item name="noHp" label="No HP">
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="email" label="Email" rules={[{ type: "email" }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>

      {/* Form untuk status meninggal */}
      {statusHidup === 0 && (
        <Row gutter={[16, 0]}>
          <Col span={8}>
            <Form.Item name="noAktaMeninggal" label="No Akta Meninggal">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="noAktaMenikah" label="No Akta Menikah">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="tglAktaMenikah" label="Tanggal Akta Menikah">
              <DatePicker format={formatTanggal} />
            </Form.Item>
          </Col>
        </Row>
      )}

      {/* Form untuk status hidup */}
      {statusHidup === 1 && (
        <Row gutter={[16, 0]}>
          <Col span={12}>
            <Form.Item name="noAktaMenikah" label="No Akta Menikah">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tglAktaMenikah" label="Tanggal Akta Menikah">
              <DatePicker format={formatTanggal} />
            </Form.Item>
          </Col>
        </Row>
      )}
    </>
  );

  return (
    <Modal width={800} title="Tambah Pasangan" open={open} onCancel={onCancel}>
      <Form layout="vertical" form={form}>
        {/* Pasangan Ke */}
        <Form.Item
          name="pasanganKe"
          label="Pasangan Ke"
          rules={[
            { required: true, message: "Pasangan Ke wajib diisi" },
            { type: "number", min: 1, message: "Nilai minimum adalah 1" },
            { type: "number", max: 10, message: "Nilai maksimum adalah 10" },
          ]}
        >
          <InputNumber min={1} max={10} />
        </Form.Item>

        {/* Status Pekerjaan Pasangan */}
        <Form.Item name="statusPekerjaan" label="Status Pekerjaan">
          <Radio.Group onChange={handleStatusPekerjaanChange}>
            <Radio.Button value="ASN">ASN</Radio.Button>
            <Radio.Button value="Non ASN">Non ASN</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Render form berdasarkan status pekerjaan */}
        {statusPekerjaan === "ASN" && renderAsnForm()}
        {statusPekerjaan === "Non ASN" && renderNonAsnForm()}
      </Form>
    </Modal>
  );
};

function FormKeluarga({ value = {} }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Tambah Keluarga</Button>
      <ModalFormKeluarga
        initalValue={value}
        open={showModal}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
}

export default FormKeluarga;
