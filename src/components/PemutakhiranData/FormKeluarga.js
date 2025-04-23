import { tambahPasanganSIASN } from "@/services/siasn-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Row,
  Select,
} from "antd";
import dayjs from "dayjs";
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
 * @param {Object} props.initalValue - Data awal pasangan
 * @returns {JSX.Element} Komponen modal form pasangan
 */

const formatTanggal = "DD-MM-YYYY";

const ModalFormKeluarga = ({ open, onCancel, initalValue }) => {
  const queryClient = useQueryClient();

  const [form] = Form.useForm();
  const [statusPekerjaan, setStatusPekerjaan] = useState(null);
  const [statusPernikahan, setStatusPernikahan] = useState(null);
  const [statusHidup, setStatusHidup] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [hiddenFields, setHiddenFields] = useState({});

  const { mutate: tambahPasangan, isLoading: loadingTambahPasangan } =
    useMutation({
      mutationFn: (data) => tambahPasanganSIASN(data),
      onSuccess: () => {
        message.success("Berhasil menambahkan pasangan");
        queryClient.invalidateQueries({ queryKey: ["pasangan"] });
        onCancel();
        form.resetFields();
        setFormValues({});
        setHiddenFields({});
      },
      onError: (error) => {
        message.error(error.response.data.message);
      },
    });

  // Mengatur nilai awal form ketika data tersedia
  useEffect(() => {
    if (initalValue) {
      // Konversi string tanggal ke objek dayjs untuk DatePicker
      const initialFormValues = { ...initalValue };
      if (initialFormValues.tglLahir) {
        initialFormValues.tglLahir = dayjs(
          initialFormValues.tglLahir,
          formatTanggal
        );
      }
      if (initialFormValues.tglAktaMenikah) {
        initialFormValues.tglAktaMenikah = dayjs(
          initialFormValues.tglAktaMenikah,
          formatTanggal
        );
      }
      if (initialFormValues.tglMenikah) {
        initialFormValues.tglMenikah = dayjs(
          initialFormValues.tglMenikah,
          formatTanggal
        );
      }

      form.setFieldsValue(initialFormValues);
      setStatusPekerjaan(initialFormValues.statusPekerjaan);
      setStatusPernikahan(initialFormValues.statusPernikahan);
      setStatusHidup(initialFormValues.statusHidup);
      setFormValues(initialFormValues);
      setHiddenFields(initialFormValues);
    }
  }, [initalValue, form]);

  // Helper untuk mengonversi tanggal dayjs ke string format
  const formatDayjsToString = (value) => {
    if (!value) return undefined;
    return typeof value === "object" && value.format
      ? value.format(formatTanggal)
      : value;
  };

  const handleSubmit = async () => {
    try {
      const visible = await form.validateFields();

      // Gabungkan nilai form yang visible dengan nilai yang tersembunyi
      const allValues = { ...hiddenFields, ...visible };

      // Format semua nilai tanggal
      const payload = {
        ...allValues,
        tglLahir: formatDayjsToString(allValues.tglLahir) || "",
        tglAktaMenikah: formatDayjsToString(allValues.tglAktaMenikah) || "",
        tglMenikah: formatDayjsToString(allValues.tglMenikah) || "",
      };

      // Di sini Anda bisa menambahkan kode untuk mengirim data ke server
      console.log("Submit payload:", payload);

      // Tutup modal setelah sukses
      tambahPasangan(payload);
    } catch (error) {
      console.error("Form validation error:", error);
    }
  };

  // Handler untuk perubahan status dengan menyimpan semua nilai form saat ini
  const handleStatusPekerjaanChange = (e) => {
    // Dapatkan semua nilai form yang saat ini terlihat
    const currentValues = form.getFieldsValue(true);

    // Simpan nilai-nilai yang tidak akan terlihat setelah perubahan
    const formType = e.target.value;
    const oldFields = { ...hiddenFields };

    if (formType === "ASN") {
      // Jika beralih ke ASN, simpan field-field Non ASN
      Object.keys(currentValues).forEach((key) => {
        if (
          ![
            "pasanganKe",
            "statusPekerjaan",
            "statusPernikahan",
            "noAktaMenikah",
            "tglAktaMenikah",
            "noAktaCerai",
            "tglMenikah",
          ].includes(key)
        ) {
          oldFields[key] = currentValues[key];
        }
      });
    } else {
      // Jika beralih ke Non ASN, simpan field-field ASN
      Object.keys(currentValues).forEach((key) => {
        if (
          [
            "statusPernikahan",
            "noAktaMenikah",
            "tglAktaMenikah",
            "noAktaCerai",
            "tglMenikah",
          ].includes(key)
        ) {
          oldFields[key] = currentValues[key];
        }
      });
    }

    setHiddenFields(oldFields);
    setFormValues({ ...formValues, ...currentValues });
    setStatusPekerjaan(formType);

    // Set nilai-nilai yang masih relevan untuk tipe form baru
    setTimeout(() => {
      const visibleFields = { statusPekerjaan: formType };

      // Tambahkan field umum
      if (currentValues.pasanganKe)
        visibleFields.pasanganKe = currentValues.pasanganKe;

      // Tambahkan field spesifik tipe
      if (formType === "ASN") {
        if (oldFields.statusPernikahan)
          visibleFields.statusPernikahan = oldFields.statusPernikahan;
        if (oldFields.statusPernikahan === "1") {
          if (oldFields.noAktaMenikah)
            visibleFields.noAktaMenikah = oldFields.noAktaMenikah;
          if (oldFields.tglAktaMenikah)
            visibleFields.tglAktaMenikah = oldFields.tglAktaMenikah;
        } else if (oldFields.statusPernikahan === "2") {
          if (oldFields.noAktaCerai)
            visibleFields.noAktaCerai = oldFields.noAktaCerai;
          if (oldFields.tglMenikah)
            visibleFields.tglMenikah = oldFields.tglMenikah;
        }
      } else {
        // Restore Non ASN fields
        const nonAsnFields = [
          "nama",
          "tglLahir",
          "jenisIdentitas",
          "nomorIdentitas",
          "agamaId",
          "statusHidup",
          "alamat",
          "noHp",
          "email",
        ];
        nonAsnFields.forEach((field) => {
          if (oldFields[field] !== undefined)
            visibleFields[field] = oldFields[field];
        });

        // Restore fields berdasarkan status hidup
        if (oldFields.statusHidup === 0 || oldFields.statusHidup === "0") {
          if (oldFields.noAktaMeninggal)
            visibleFields.noAktaMeninggal = oldFields.noAktaMeninggal;
        }
        if (oldFields.noAktaMenikah)
          visibleFields.noAktaMenikah = oldFields.noAktaMenikah;
        if (oldFields.tglAktaMenikah)
          visibleFields.tglAktaMenikah = oldFields.tglAktaMenikah;
      }

      form.setFieldsValue(visibleFields);
    }, 0);
  };

  // Handler untuk perubahan status pernikahan
  const handleStatusPernikahanChange = (e) => {
    const currentValues = form.getFieldsValue(true);
    const newStatus = e.target.value;

    // Simpan nilai field yang akan disembunyikan
    const oldFields = { ...hiddenFields };
    if (newStatus === "1") {
      // Simpan field untuk status cerai
      if (currentValues.noAktaCerai)
        oldFields.noAktaCerai = currentValues.noAktaCerai;
      if (currentValues.tglMenikah)
        oldFields.tglMenikah = currentValues.tglMenikah;
    } else {
      // Simpan field untuk status menikah
      if (currentValues.noAktaMenikah)
        oldFields.noAktaMenikah = currentValues.noAktaMenikah;
      if (currentValues.tglAktaMenikah)
        oldFields.tglAktaMenikah = currentValues.tglAktaMenikah;
    }

    setHiddenFields(oldFields);
    setFormValues({ ...formValues, ...currentValues });
    setStatusPernikahan(newStatus);
  };

  // Handler untuk perubahan status hidup
  const handleStatusHidupChange = (e) => {
    const currentValues = form.getFieldsValue(true);
    const newStatus = e.target.value;

    // Simpan nilai field yang akan disembunyikan
    const oldFields = { ...hiddenFields };
    if (newStatus === 0 || newStatus === "0") {
      // Simpan field untuk status hidup
      // (tidak ada field yang perlu disimpan khusus)
    } else {
      // Simpan field untuk status meninggal
      if (currentValues.noAktaMeninggal)
        oldFields.noAktaMeninggal = currentValues.noAktaMeninggal;
    }

    setHiddenFields(oldFields);
    setFormValues({ ...formValues, ...currentValues });
    setStatusHidup(newStatus);
  };

  // Handler untuk perubahan nilai form apapun
  const handleValuesChange = (changedValues, allValues) => {
    // Update formValues state dengan nilai yang berubah
    setFormValues({ ...formValues, ...changedValues });
  };

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
            <Form.Item name="tglAktaMenikah" label="Tanggal Akta Menikah">
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
      {statusHidup === 0 || statusHidup === "0" ? (
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
      ) : (
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
    <Modal
      width={800}
      title="Tambah Pasangan"
      open={open}
      confirmLoading={loadingTambahPasangan}
      onOk={handleSubmit}
      onCancel={() => {
        onCancel();
        form.resetFields();
        setFormValues({});
        setHiddenFields({});
        setStatusPekerjaan(null);
        setStatusPernikahan(null);
        setStatusHidup(null);
      }}
      footer={[
        <Button key="back" onClick={onCancel}>
          Batal
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Simpan
        </Button>,
      ]}
    >
      <Form
        layout="vertical"
        form={form}
        onValuesChange={handleValuesChange}
        preserve={false}
      >
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
      <Button type="primary" onClick={() => setShowModal(true)}>
        Tambah Pasangan
      </Button>
      <ModalFormKeluarga
        initalValue={value}
        open={showModal}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
}

export default FormKeluarga;
