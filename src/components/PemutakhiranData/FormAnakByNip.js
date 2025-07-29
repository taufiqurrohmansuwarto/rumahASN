import { postAnakByNip } from "@/services/siasn-services";
import {
  refAgama,
  refDokumen,
  refJenisAnak,
  refJenisKawin,
} from "@/utils/data-utils";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  Collapse,
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
import { useState, useEffect } from "react";
import { rwAnakByNip } from "@/services/master.services";

// buat fungsi jika undefined ganti ""
const handleUndefined = (value) => {
  if (value === undefined) return "";
  return value;
};

const FormModalAnak = ({ nip, pasangan, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [statusHidupAnak, setStatusHidupAnak] = useState("1");
  const [selectedAnak, setSelectedAnak] = useState(null);

  // Reset form ketika modal dibuka
  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      setSelectedAnak(null);
      setStatusHidupAnak("1");
    }
  }, [isOpen, form]);

  const handleStatusHidupChange = (e) => {
    setStatusHidupAnak(e.target.value);
  };

  /**[{"anak_id":145527,"pegawai_id":82591,"suami_istri_id":0,"nama":"ZELINE SAFA AGHNIA","nik":"1571015604240001","no_bpjs":"0003587329809","jk":"P","tempat_lahir":"Jambi ","tgl_lahir":"16-04-2024","status_anak_id":1,"pekerjaan_anak_id":1,"tunjangan":"Tidak Dapat","file_akta_anak":"82591-Anak-Kandung-20240813-340-zeline_(1).pdf","file_ktp_anak":"","file_askes_bpjs_anak":"82591-askes_bpjs-Anak-Kandung-20240813-466-WhatsApp_Image_2024-08-13_at_09.35.37.jpeg","tgl_edit":"2024-08-12T17:00:00.000Z","jam_edit":"09:35:50","pekerjaan_anak":{"pekerjaan_id":1,"pekerjaan":"Balita"},"status_anak":{"status_anak_id":1,"status_anak":"Anak Kandung"},"rwyt_suami_istri":null}] */
  const { data: dataAnakSimaster, isLoading: loadingAnakSimaster } = useQuery({
    queryKey: ["anak-simaster", nip],
    queryFn: () => rwAnakByNip(nip),
    enabled: !!nip,
    keepPreviousData: true,
  });

  const { mutateAsync: postAnak, isLoading: loadingPostAnak } = useMutation(
    (data) => postAnakByNip({ nip, data }),
    {
      onSuccess: () => {
        message.success("Berhasil menambahkan anak");
        onClose();
        form.resetFields();
        queryClient.invalidateQueries({
          queryKey: ["anak-siasn"],
        });
      },
      onError: (error) => {
        const msg = error?.response?.data?.message;
        message.error(msg || "Gagal menambahkan anak");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["anak-siasn"],
        });
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
        tanggal ? dayjs(tanggal).format("DD-MM-YYYY") : "";

      const payload = {
        ...hasilValidasi,
        tglLahir: formatTanggal(hasilValidasi.tglLahir),
        tglMeninggal: formatTanggal(hasilValidasi.tglMeninggal),
      };

      // Menambahkan data pasangan
      const dataLengkap = {
        ...payload,
        pasanganId: pasangan?.orangId,
        pnsOrangId: pasangan?.pnsOrangId,
      };

      const payloadLengkap = { nip, data: dataLengkap };

      await postAnak(payloadLengkap);
    } catch (error) {}
  };

  const handleAnakSelection = (anakId) => {
    if (!anakId) {
      // Jika clear/kosong, reset form
      handleResetForm();
      return;
    }

    const selectedAnakData = dataAnakSimaster?.find(
      (anak) => anak.anak_id === anakId
    );
    if (selectedAnakData) {
      setSelectedAnak(selectedAnakData);

      // Konversi format tanggal dari DD-MM-YYYY ke dayjs object
      const convertDateFormat = (dateString) => {
        if (!dateString) return null;
        // Jika format DD-MM-YYYY
        if (dateString.includes("-")) {
          const [day, month, year] = dateString.split("-");
          return dayjs(`${year}-${month}-${day}`);
        }
        return dayjs(dateString);
      };

      // Set form values dengan data yang dipilih
      form.setFieldsValue({
        nama: selectedAnakData.nama,
        jenisKelamin: selectedAnakData.jk === "P" ? "M" : "F", // P -> F, L -> M
        tglLahir: convertDateFormat(selectedAnakData.tgl_lahir),
        jenisAnakId: selectedAnakData.status_anak_id?.toString() || "1", // default kandung
        agamaId: "1", // default Islam
        statusHidup: "1", // default hidup
        isPns: "0", // default tidak
        // Field opsional dikosongkan
        nomorHp: "",
        nomorTelpon: "",
        jenisIdDokumenId: undefined,
        nomorIdDocument: "",
        aktaKelahiran: "",
        jenisKawinId: undefined,
        email: "",
        alamat: "",
      });

      // Set status hidup untuk conditional rendering
      setStatusHidupAnak("1");
    }
  };

  const handleResetForm = () => {
    form.resetFields();
    setSelectedAnak(null);
    setStatusHidupAnak("1");
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
      title={`Tambah Anak dari Pasangan ${pasangan?.nama}`}
      open={isOpen}
      centered
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
        {/* Dropdown untuk memilih anak jika dataAnakSimaster > 1 */}
        {dataAnakSimaster && dataAnakSimaster.length > 0 && (
          <Row gutter={[16, 0]} style={{ marginBottom: 16 }}>
            <Col span={18}>
              <Form.Item label="Pilih Anak yang Sudah Ada (Opsional)">
                <Select
                  placeholder="Pilih anak dari data Simaster..."
                  allowClear
                  onChange={handleAnakSelection}
                  value={selectedAnak?.anak_id}
                >
                  {dataAnakSimaster.map((anak) => (
                    <Select.Option key={anak.anak_id} value={anak.anak_id}>
                      {anak.nama} -{" "}
                      {anak.jk === "P" ? "Perempuan" : "Laki-laki"} (
                      {anak.tgl_lahir})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label=" ">
                <Button type="default" onClick={handleResetForm} block>
                  Reset Form
                </Button>
              </Form.Item>
            </Col>
          </Row>
        )}

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
              name="jenisAnakId"
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
                <Radio value={"1"}>Ya</Radio>
                <Radio value={"0"}>Tidak</Radio>
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
        <Collapse
          defaultActiveKey={[]}
          style={{ marginTop: 16 }}
          items={[
            {
              key: "1",
              label: "Data Tambahan (Opsional)",
              extra: (
                <Button
                  type="link"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetOptionalData();
                  }}
                >
                  Reset
                </Button>
              ),
              children: (
                <div>
                  <Row gutter={[16, 0]}>
                    <Col span={12}>
                      <Form.Item
                        name="nomorHp"
                        label="Nomor HP"
                        rules={[
                          {
                            pattern: /^[0-9]{10,13}$/,
                            message:
                              "Format nomor HP tidak valid (10-13 digit)",
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
                      <Form.Item
                        name="nomorIdDocument"
                        label="Nomor ID Document"
                      >
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
                </div>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

function FormAnakByNip({ nip, pasangan }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <Button shape="round" type="primary" onClick={handleOpenModal}>
        Tambah Anak
      </Button>
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
