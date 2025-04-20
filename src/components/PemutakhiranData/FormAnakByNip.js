import { postAnakByNip } from "@/services/siasn-services";
import {
  refAgama,
  refDokumen,
  refJenisAnak,
  refJenisKawin,
} from "@/utils/data-utils";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";

// buat fungsi jika undefined ganti ""
const handleUndefined = (value) => {
  if (value === undefined) return "";
  return value;
};

const FormModalAnak = ({ nip, pasangan, isOpen, onClose }) => {
  const [form] = Form.useForm();
  const [statusHidupAnak, setStatusHidupAnak] = useState("1");

  const handleStatusHidupChange = (e) => {
    setStatusHidupAnak(e.target.value);
  };

  const { mutateAsync: postAnak, isLoading: loadingPostAnak } = useMutation(
    (data) => postAnakByNip({ nip, data }),
    {
      onSuccess: () => {
        message.success("Berhasil menambahkan anak");
        onClose();
        form.resetFields();
      },
      onError: (error) => {
        const msg = error?.response?.data?.message;
        message.error(msg || "Gagal menambahkan anak");
      },
    }
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Mengubah nilai undefined menjadi string kosong
      const hasilValidasi = Object.keys(values).reduce((acc, key) => {
        acc[key] = handleUndefined(values[key]);
        return acc;
      }, {});

      // Memformat tanggal ke format YYYY-MM-DD
      const formatTanggal = (tanggal) =>
        tanggal ? dayjs(tanggal).format("YYYY-MM-DD") : "";

      const payload = {
        ...hasilValidasi,
        tglLahir: formatTanggal(hasilValidasi.tglLahir),
        tglMeninggal: formatTanggal(hasilValidasi.tglMeninggal),
      };

      // Menambahkan data pasangan
      const dataLengkap = {
        ...payload,
        pasanganId: pasangan?.dataPernikahan?.orangId,
        pnsOrangId: pasangan?.dataPernikahan?.pnsOrangId,
      };

      await postAnak({ nip, data: dataLengkap });
    } catch (error) {}
  };

  const handleResetOptionalData = () => {
    // Reset hanya field data opsional
    form.setFieldsValue({
      nomorHp: undefined,
      nomorTelpon: undefined,
      jenisIdDokumenId: undefined,
      nomorIdDocument: undefined,
      aktaKelahiran: undefined,
      jenisKawinId: undefined,
      email: undefined,
      alamat: undefined,
    });
  };

  return (
    <Modal
      width={850}
      title={`Tambah Anak ${pasangan?.orang?.nama}`}
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Batal
        </Button>,
        <Button
          loading={loadingPostAnak}
          disabled={loadingPostAnak}
          key="submit"
          type="primary"
          onClick={handleSubmit}
        >
          Simpan
        </Button>,
      ]}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        {/* Seksi Data Wajib Anak */}
        <Typography.Title level={5}>Data Anak</Typography.Title>

        <Row gutter={[16, 0]}>
          <Col span={24}>
            <Form.Item
              name="nama"
              label="Nama"
              rules={[{ required: true, message: "Nama wajib diisi" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col span={12}>
            <Form.Item
              name="jenisKelamin"
              label="Jenis Kelamin"
              rules={[
                { required: true, message: "Jenis kelamin wajib dipilih" },
              ]}
            >
              <Radio.Group>
                <Radio value="M">Laki-laki</Radio>
                <Radio value="F">Perempuan</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="statusAnakId"
              label="Status Anak"
              rules={[{ required: true, message: "Status anak wajib dipilih" }]}
            >
              <Radio.Group>
                {refJenisAnak.map((item) => (
                  <Radio key={item.id} value={item.id}>
                    {item.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col span={12}>
            <Form.Item
              name="isPns"
              label="Status PNS"
              rules={[{ required: true, message: "Status PNS wajib dipilih" }]}
            >
              <Radio.Group>
                <Radio value={true}>Ya</Radio>
                <Radio value={false}>Tidak</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="agamaId"
              label="Agama"
              rules={[{ required: true, message: "Agama wajib dipilih" }]}
            >
              <Select placeholder="Pilih agama">
                {refAgama.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col span={12}>
            <Form.Item
              name="tglLahir"
              label="Tanggal Lahir"
              rules={[{ required: true, message: "Tanggal lahir wajib diisi" }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="statusHidup"
              label="Status Hidup"
              rules={[
                { required: true, message: "Status hidup wajib dipilih" },
              ]}
            >
              <Radio.Group onChange={handleStatusHidupChange}>
                <Radio value="1">Hidup</Radio>
                <Radio value="0">Meninggal</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        {statusHidupAnak === "0" && (
          <>
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  name="tglMeninggal"
                  label="Tanggal Meninggal"
                  rules={[
                    {
                      required: true,
                      message: "Tanggal meninggal wajib diisi",
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="aktaMeninggal"
                  label="Akta Kematian"
                  rules={[
                    { required: true, message: "Akta kematian wajib diisi" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* Seksi Data Tambahan (Opsional) */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginTop: 16, marginBottom: 8 }}
        >
          <Col>
            <Typography.Title level={5} style={{ margin: 0 }}>
              Data Tambahan (Opsional)
            </Typography.Title>
          </Col>
          <Col>
            <Button type="default" onClick={handleResetOptionalData}>
              Reset Data Opsional
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col span={12}>
            <Form.Item
              name="nomorHp"
              label="Nomor HP"
              rules={[
                {
                  pattern: /^[0-9]{10,13}$/,
                  message: "Format nomor HP tidak valid (10-13 digit)",
                },
              ]}
            >
              <Input placeholder="Contoh: 08123456789" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="nomorTelpon"
              label="Nomor Telepon"
              rules={[
                {
                  pattern: /^[0-9]{5,12}$/,
                  message: "Format nomor telepon tidak valid",
                },
              ]}
            >
              <Input placeholder="Contoh: 0217654321" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col span={12}>
            <Form.Item name="jenisIdDokumenId" label="Jenis Dokumen">
              <Select placeholder="Pilih jenis dokumen">
                {refDokumen.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="nomorIdDocument" label="Nomor ID Document">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col span={12}>
            <Form.Item name="aktaKelahiran" label="Akta Kelahiran">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="jenisKawinId" label="Status Kawin">
              <Select placeholder="Pilih status kawin">
                {refJenisKawin.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  type: "email",
                  message: "Format email tidak valid",
                },
              ]}
            >
              <Input placeholder="contoh@email.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="alamat" label="Alamat">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

function FormAnakByNip({ key, pasangan }) {
  const router = useRouter();
  const { nip } = router.query;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <Button onClick={handleOpenModal}>Tambah Anak</Button>
      <FormModalAnak
        nip={nip}
        pasangan={pasangan}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default FormAnakByNip;
