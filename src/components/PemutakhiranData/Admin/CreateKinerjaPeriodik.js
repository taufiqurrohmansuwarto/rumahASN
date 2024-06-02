import {
  getKuadran,
  refHasilKerja,
  refKoefisien,
  refPeriodik,
} from "@/utils/client-utils";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  message,
} from "antd";
import React from "react";
import { useState } from "react";
import FormCariPNSKinerja from "../FormCariPNSKinerja";
import dayjs from "dayjs";
import {
  createKinerjaPeriodikByNip,
  dataKinerjaPns,
  dataUtamSIASNByNip,
} from "@/services/siasn-services";
import { toNumber, toString } from "lodash";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 
 * {
  "bulanMulaiPenilaian": 0,
  "bulanSelesaiPenilaian": 0,
  "hasilKinerjaNilai": 0,
  "id": "string",
  "koefisienId": "string",
  "kuadranKinerjaNilai": 0,
  "path": [
    {
      "dok_id": "string",
      "dok_nama": "string",
      "dok_uri": "string",
      "object": "string",
      "slug": "string"
    }
  ],
  "penilaiGolongan": "string",
  "penilaiJabatanNama": "string",
  "penilaiNama": "string",
  "penilaiNipNrp": "string",
  "penilaiUnorNama": "string",
  "perilakuKerjaNilai": 0,
  "periodikId": "string",
  "pnsDinilaiId": "string",
  "statusPenilai": "string",
  "tahun": 0,
  "tahunMulaiPenilaian": 0,
  "tahunSelesaiPenilaian": 0
}

Parameter c
 */

const ModalCreate = ({ visible, onClose, nip }) => {
  const [form] = Form.useForm();
  const [formLoading, setFormLoading] = useState(false);

  const queryClient = useQueryClient();

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createKinerjaPeriodikByNip(data),
    {
      onSuccess: () => {
        message.success("Berhasil menambahkan kinerja periodik");
        onClose();
        form.resetFields();
      },
      onError: (error) => {
        message.error("Gagal menambahkan kinerja periodik");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["kinerja-periodik", nip]);
      },
    }
  );

  const onFinish = async () => {
    setFormLoading(true);
    const values = await form.validateFields();
    const atasan = await dataKinerjaPns(values.pns_penilai);
    const currentNip = await dataUtamSIASNByNip(nip);

    const payload = {
      pnsDinilaiId: currentNip?.id,
      tahun: toNumber(dayjs(values.tahun).format("YYYY")),
      tahunMulaiPenilaian: toNumber(
        dayjs(values.tahunMulaiPenilaian).format("YYYY")
      ),
      tahunSelesaiPenilaian: toNumber(
        dayjs(values.tahunSelesaiPenilaian).format("YYYY")
      ),
      bulanMulaiPenilaian: dayjs(values.bulanMulaiPenilaian).format("M"),
      bulanSelesaiPenilaian: dayjs(values.bulanSelesaiPenilaian).format("M"),
      statusPenilai: "ASN",
      penilaiGolongan: atasan?.golongan_id,
      penilaiJabatanNama: atasan?.jabatan_nama,
      penilaiNama: atasan?.nama,
      penilaiNipNrp: atasan?.nip_baru,
      penilaiUnorNama: atasan?.unor_nm,
      koefisienId: toString(values?.koefisienId),
      perilakuKerjaNilai: values?.perilakuKerjaNilai,
      hasilKinerjaNilai: values?.hasilKinerjaNilai,
      periodikId: toString(values?.periodikId),
      kuadranKinerjaNilai: getKuadran(
        values?.hasilKinerjaNilai,
        values?.perilakuKerjaNilai
      ),
    };

    const sendData = {
      nip,
      data: payload,
    };

    console.log(atasan);

    await create(sendData);
    setFormLoading(false);
  };

  return (
    <Modal
      centered
      width={800}
      title="Tambah Kinerja Periodik"
      confirmLoading={isLoadingCreate || formLoading}
      open={visible}
      onOk={onFinish}
      onCancel={onClose}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          name="tahun"
          label="Tahun"
          rules={[{ required: true, message: "Tahun harus diisi" }]}
        >
          <DatePicker picker="year" />
        </Form.Item>
        <Row gutter={[16, 16]}>
          <Col md={6}>
            <Form.Item
              name="bulanMulaiPenilaian"
              label="Bulan Mulai Penilaian"
              rules={[
                {
                  required: true,
                  message: "Bulan mulai penilaian harus diisi",
                },
              ]}
            >
              <DatePicker picker="month" />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Bulan selesai penilaian harus diisi",
                },
              ]}
              name="bulanSelesaiPenilaian"
              label="Bulan Selesai Penilaian"
            >
              <DatePicker picker="month" />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Tahun mulai penilaian harus diisi",
                },
              ]}
              name="tahunMulaiPenilaian"
              label="Tahun Mulai Penilaian"
            >
              <DatePicker picker="year" />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Tahun selesai penilaian harus diisi",
                },
              ]}
              name="tahunSelesaiPenilaian"
              label="Tahun Selesai Penilaian"
            >
              <DatePicker picker="year" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="hasilKinerjaNilai"
          label="Hasil Kinerja Nilai"
          rules={[
            { required: true, message: "Hasil kinerja nilai harus diisi" },
          ]}
        >
          <Select>
            {refHasilKerja.map((item) => (
              <Select.Option key={item?.value} value={item.value}>
                {item.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="perilakuKerjaNilai"
          label="Perilaku Kinerja Nilai"
          rules={[
            { required: true, message: "Perilaku kinerja nilai harus diisi" },
          ]}
        >
          <Select>
            {refHasilKerja.map((item) => (
              <Select.Option key={item?.value} value={item.value}>
                {item.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="periodikId"
          label="Periode"
          rules={[{ required: true, message: "Periode harus diisi" }]}
        >
          <Select>
            {refPeriodik.map((item) => (
              <Select.Option key={item?.value} value={item.value}>
                {item.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="koefisienId"
          label="Jabatan"
          rules={[{ required: true, message: "Jabatan harus diisi" }]}
        >
          <Select>
            {refKoefisien.map((item) => (
              <Select.Option key={item?.value} value={item.value}>
                {item.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <FormCariPNSKinerja
          help="ketik NIP Tanpa Spasi dan tunggu..."
          label="Atasan Penilai"
          name="pns_penilai"
        />
      </Form>
    </Modal>
  );
};

function CreateKinerjaPeriodik() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  const nip = router.query?.nip;

  const handleOpen = () => {
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Button onClick={handleOpen} type="primary">
        Tambah Kinerja Periodik
      </Button>
      <ModalCreate nip={nip} visible={visible} onClose={handleClose} />
    </>
  );
}

export default CreateKinerjaPeriodik;
