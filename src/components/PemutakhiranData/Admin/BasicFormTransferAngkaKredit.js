import React, { useEffect } from "react";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Upload,
  message,
  Spin,
} from "antd";
import { FileAddOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postRwAngkakreditByNip,
  uploadDokRiwayat,
} from "@/services/siasn-services";
import { serializeAngkaKredit } from "@/utils/transfer-siasn.utils";
import FormRiwayatJabatanByNip from "../FormRiwayatJabatanByNip";
import FormAngkaKreditPredikat from "./FormAngkaKreditPredikat";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const serializeJenisAK = (data) => {
  const periodeAwal = data?.periode_awal?.split("-");
  const periodeAkhir = data?.periode_akhir?.split("-");

  const bulanMulaiPenailan = periodeAwal?.[1] || "";
  const bulanSelesaiPenailan = periodeAkhir?.[1] || "";
  const tahunMulaiPenailan = periodeAwal?.[2] || "";
  const tahunSelesaiPenailan = periodeAkhir?.[2] || "";

  let payload = {
    nomorSk: data?.no_sk,
    tanggalSk: dayjs(data?.tgl_sk, "DD-MM-YYYY"),
    tahun: "",
    kreditUtamaBaru: 0,
    kreditPenunjangBaru: 0,
    kreditBaruTotal: 0,
    bulanMulaiPenailan: bulanMulaiPenailan,
    bulanSelesaiPenailan: bulanSelesaiPenailan,
    tahunMulaiPenailan: tahunMulaiPenailan,
    tahunSelesaiPenailan: tahunSelesaiPenailan,
    mulaiPenilaian: dayjs(data?.periode_awal, "YYYY-MM"),
    selesaiPenilaian: dayjs(data?.periode_akhir, "YYYY-MM"),
  };

  //   angka kredit pertama
  if (data?.jenis_pak_id === 1) {
    payload = {
      ...payload,
      isAngkaKreditPertama: "1",
      isIntegrasi: "0",
      isKonversi: "0",
      kreditUtamaBaru: data?.nilai_unsur_utama_baru,
      kreditPenunjangBaru: data?.nilai_unsur_penunjang_baru,
      kreditBaruTotal: data?.nilai_pak,
      jenisAngkaKredit: "isAngkaKreditPertama",
    };
  }

  //   integrasi
  if (data?.jenis_pak_id === 3) {
    payload = {
      ...payload,
      isAngkaKreditPertama: "0",
      isIntegrasi: "1",
      isKonversi: "0",
      kreditBaruTotal: data?.nilai_pak,
      jenisAngkaKredit: "isIntegrasi",
    };
  }

  //   konversi
  if (data?.jenis_pak_id === 4) {
    payload = {
      ...payload,
      isAngkaKreditPertama: "0",
      isIntegrasi: "0",
      isKonversi: "1",
      kreditBaruTotal: data?.nilai_pak,
      tahun: dayjs(data?.periode_awal).isValid()
        ? dayjs(data?.periode_awal)
        : "",
      jenisAngkaKredit: "isKonversi",
    };
  }

  return payload;
};

const BasicFormTransferAngkaKredit = ({
  data,
  onCancel,
  open,
  nip,
  file,
  loadingFile,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // State untuk mengatur tampilan form
  const [showFieldAngkaKredit, setShowFieldAngkaKredit] = React.useState(true);
  const [showTahun, setShowTahun] = React.useState(false);
  const [isKonversi, setIsKonversi] = React.useState(false);
  const [isIntegrasi, setIsIntegrasi] = React.useState(false);
  const [selectedRwJabatanId, setSelectedRwJabatanId] = React.useState(null);

  const { mutateAsync: tambah, isLoading: isLoadingTambah } = useMutation(
    (data) => postRwAngkakreditByNip(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("angka-kredit");
        onCancel();
        message.success("Berhasil menambahkan angka kredit");
      },
      onSettled: () => {
        queryClient.invalidateQueries("angka-kredit");
        onCancel();
      },
      onError: () => {
        message.error("Gagal menambahkan angka kredit");
      },
    }
  );

  // Set initial form values dan state berdasarkan data transfer
  useEffect(() => {
    if (data) {
      const jenisAk = serializeJenisAK(data);
      form.setFieldsValue(jenisAk);

      // Set state berdasarkan jenis angka kredit
      if (data?.jenis_pak_id === 1) {
        // Angka Kredit Pertama
        setIsKonversi(false);
        setIsIntegrasi(false);
        setShowFieldAngkaKredit(true);
        setShowTahun(false);
      } else if (data?.jenis_pak_id === 3) {
        // Integrasi
        setIsKonversi(false);
        setIsIntegrasi(true);
        setShowFieldAngkaKredit(false);
        setShowTahun(false);
      } else if (data?.jenis_pak_id === 4) {
        // Konversi
        setIsKonversi(true);
        setIsIntegrasi(false);
        setShowFieldAngkaKredit(false);
        setShowTahun(true);
      }
    }
  }, [data, form]);

  // Handle perubahan nilai form
  const handleFormValuesChange = (changedValues, allValues) => {
    if (changedValues.rwJabatanId) {
      setSelectedRwJabatanId(changedValues.rwJabatanId);
    }
  };

  const handleFinish = async () => {
    const values = await form.validateFields();
    const serializedData = serializeAngkaKredit(values);

    const payload = {
      nip,
      data: serializedData,
    };

    if (!file) {
      await tambah(payload);
    } else {
      const result = await tambah(payload);
      const id = result?.id;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("id_riwayat", id);
      formData.append("id_ref_dokumen", "879");
      await uploadDokRiwayat(formData);
      queryClient.invalidateQueries("angka-kredit");
    }
  };

  return (
    <>
      <Spin spinning={loadingFile} />
      <Modal
        confirmLoading={isLoadingTambah}
        title="Transfer Angka Kredit"
        centered
        open={open}
        width={800}
        onCancel={onCancel}
        onOk={handleFinish}
        destroyOnClose
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
                  <div>
                    {data?.file_pak && (
                      <a
                        href={data?.file_pak}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "block", marginBottom: 8 }}
                      >
                        Lihat File Asli
                      </a>
                    )}
                    {file && <div>File baru: {file.name}</div>}
                  </div>
                </Form.Item>
              </Col>
              <Col span={14}>
                <Form.Item
                  name="jenisAngkaKredit"
                  label="Jenis Angka Kredit"
                  required
                >
                  <Radio.Group
                    disabled
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
                      <DatePicker
                        format="DD-MM-YYYY"
                        style={{ width: "100%" }}
                      />
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
                          step={0.001}
                          precision={3}
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
    </>
  );
};

export default BasicFormTransferAngkaKredit;
