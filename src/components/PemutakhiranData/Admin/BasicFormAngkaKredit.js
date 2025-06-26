import {
  postRwAngkakreditByNip,
  uploadDokRiwayat,
} from "@/services/siasn-services";
import { FileAddOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

import {
  Button,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Typography,
  Upload,
  message,
} from "antd";
import { useState } from "react";
import FormRiwayatJabatanByNip from "../FormRiwayatJabatanByNip";
import FormAngkaKreditPredikat from "./FormAngkaKreditPredikat";

const { Title, Text } = Typography;

const BasicFormAngkaKredit = ({ visible, onCancel, nip }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  const [fileList, setFileList] = useState([]);
  const [showFieldAngkaKredit, setShowFieldAngkaKredit] = useState(true);
  const [showTahun, setShowTahun] = useState(false);
  const [isKonversi, setIsKonversi] = useState(false);
  const [isIntegrasi, setIsIntegrasi] = useState(false);
  const [selectedRwJabatanId, setSelectedRwJabatanId] = useState(null);

  // Handle perubahan nilai form
  const handleFormValuesChange = (changedValues, allValues) => {
    if (changedValues.rwJabatanId) {
      setSelectedRwJabatanId(changedValues.rwJabatanId);
    }
  };

  // Reset state ketika modal ditutup
  const handleModalCancel = () => {
    setSelectedRwJabatanId(null);
    setIsKonversi(false);
    setIsIntegrasi(false);
    setShowFieldAngkaKredit(true);
    setShowTahun(false);
    form.resetFields();
    onCancel();
  };

  const handleChange = (info) => {
    let fileList = [...info.fileList];

    fileList = fileList.slice(-1);

    fileList = fileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(fileList);
  };

  const onFinish = async () => {
    setLoading(true);
    try {
      const result = await form.validateFields();
      const { selesaiPenilaian, mulaiPenilaian, ...rest } = result;
      const data = {
        ...rest,
        tahun: rest?.tahun?.format("YYYY") || "",
        kreditUtamaBaru: rest?.kreditUtamaBaru || 0,
        kreditPenunjangBaru: rest?.kreditPenunjangBaru || 0,
        bulanMulaiPenailan: mulaiPenilaian.format("M"),
        bulanSelesaiPenailan: selesaiPenilaian.format("M"),
        tahunMulaiPenailan: mulaiPenilaian.format("YYYY"),
        tahunSelesaiPenailan: selesaiPenilaian.format("YYYY"),
        isAngkaKreditPertama:
          rest?.jenisAngkaKredit === "isAngkaKreditPertama" ? "1" : "0",
        isIntegrasi: rest?.jenisAngkaKredit === "isIntegrasi" ? "1" : "0",
        isKonversi: rest?.jenisAngkaKredit === "isKonversi" ? "1" : "0",
        tanggalSk: rest?.tanggalSk.format("DD-MM-YYYY"),
      };

      const currentFile = fileList[0]?.originFileObj;

      if (currentFile) {
        const angkaKredit = await postRwAngkakreditByNip({
          data,
          nip,
        });

        const formData = new FormData();
        formData.append("file", currentFile);
        formData.append("id_ref_dokumen", "879");
        formData.append("id_riwayat", angkaKredit?.id);
        await uploadDokRiwayat(formData);
        queryClient.invalidateQueries("angka-kredit");
        setLoading(false);
        onCancel();
        setFileList([]);
        message.success("Berhasil menambahkan angka kredit");
      } else {
        await postRwAngkakreditByNip({
          data,
          nip,
        });

        queryClient.invalidateQueries("angka-kredit");
        setLoading(false);
        onCancel();
        setFileList([]);
        message.success("Berhasil menambahkan angka kredit");
      }
    } catch (error) {
      setLoading(false);
      message.error(
        error?.response?.data?.message || "Gagal menambahkan angka kredit"
      );
      console.log(error);
    }
  };

  return (
    <Modal
      confirmLoading={loading}
      title="Tambah Angka Kredit"
      centered
      open={visible}
      width={800}
      onCancel={handleModalCancel}
      onOk={onFinish}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormValuesChange}
      >
        <Flex vertical gap="small">
          {/* Upload File dan Jenis Angka Kredit */}
          <Row gutter={8}>
            <Col span={10}>
              <Form.Item label="Dokumen Pendukung">
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  accept=".pdf"
                  onChange={handleChange}
                  fileList={fileList}
                >
                  <Button icon={<FileAddOutlined />} size="small">
                    Pilih File PDF
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item
                name="jenisAngkaKredit"
                label="Jenis Angka Kredit"
                required
                rules={[
                  {
                    required: true,
                    message: "Pilih Jenis Angka Kredit",
                  },
                ]}
              >
                <Radio.Group
                  onChange={(e) => {
                    const value = e.target.value;

                    // Ubah tampilan form berdasarkan jenis yang dipilih
                    if (value === "isKonversi") {
                      setIsKonversi(true);
                      setIsIntegrasi(false);
                      setShowFieldAngkaKredit(false);
                      setShowTahun(true);
                    } else if (value === "isIntegrasi") {
                      setIsKonversi(false);
                      setIsIntegrasi(true);
                      setShowFieldAngkaKredit(false);
                      setShowTahun(false);
                    } else {
                      setIsKonversi(false);
                      setIsIntegrasi(false);
                      setShowFieldAngkaKredit(true);
                      setShowTahun(false);
                    }
                  }}
                >
                  <Radio.Button value="isAngkaKreditPertama">
                    Pertama
                  </Radio.Button>
                  <Radio.Button value="isIntegrasi">Integrasi</Radio.Button>
                  <Radio.Button value="isKonversi">Konversi</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          {/* Riwayat Jabatan */}
          <FormRiwayatJabatanByNip nip={nip} name="rwJabatanId" />

          {/* Detail Form - Muncul setelah jabatan dipilih */}
          {selectedRwJabatanId && (
            <div>
              {/* SK dan Tanggal */}
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item required name="nomorSk" label="Nomor SK">
                    <Input placeholder="Masukkan nomor SK" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item required name="tanggalSk" label="Tanggal SK">
                    <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              {/* Periode Penilaian dan Tahun */}
              <Row gutter={8}>
                <Col span={8}>
                  <Form.Item
                    required
                    name="mulaiPenilaian"
                    label="Mulai Penilaian"
                  >
                    <DatePicker picker="month" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    required
                    name="selesaiPenilaian"
                    label="Selesai Penilaian"
                  >
                    <DatePicker picker="month" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                {showTahun && (
                  <Col span={8}>
                    <Form.Item required name="tahun" label="Tahun">
                      <DatePicker picker="year" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                )}
              </Row>

              {/* Field Angka Kredit untuk Angka Kredit Pertama */}
              {showFieldAngkaKredit && (
                <Row gutter={8}>
                  <Col span={8}>
                    <Form.Item
                      required
                      name="kreditUtamaBaru"
                      label="Kredit Utama"
                    >
                      <InputNumber
                        min={0}
                        step={0.01}
                        precision={2}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      required
                      name="kreditPenunjangBaru"
                      label="Kredit Penunjang"
                    >
                      <InputNumber
                        min={0}
                        step={0.01}
                        precision={2}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      required
                      name="kreditBaruTotal"
                      label="Total Kredit"
                    >
                      <InputNumber
                        min={0}
                        step={0.01}
                        precision={2}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {/* Field khusus untuk Integrasi - hanya Total Kredit */}
              {isIntegrasi && (
                <Row gutter={8}>
                  <Col span={8}>
                    <Form.Item
                      required
                      name="kreditBaruTotal"
                      label="Total Kredit"
                    >
                      <InputNumber
                        min={0}
                        step={0.01}
                        precision={2}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {/* Form Predikat khusus untuk Konversi */}
              {isKonversi && (
                <FormAngkaKreditPredikat
                  form={form}
                  jabatanId={selectedRwJabatanId}
                />
              )}
            </div>
          )}
        </Flex>
      </Form>
    </Modal>
  );
};

export default BasicFormAngkaKredit;
