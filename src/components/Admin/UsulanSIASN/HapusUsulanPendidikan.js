import {
  createUsulanPeremajaanPendidikan,
  submitUsulanPeremajaanPendidikan,
} from "@/services/admin.services";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
} from "antd";
import { useState } from "react";

const ModalHapusPendidikan = ({ open, row, onCancel, usulanId }) => {
  const [form] = Form.useForm();

  const { mutate: submit, isLoading: submitLoading } = useMutation(
    (data) => submitUsulanPeremajaanPendidikan(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus pendidikan");
        onCancel();
      },
      onError: () => {
        message.error("error");
      },
    }
  );

  // Helper function untuk mengubah null/empty menjadi "-"
  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    return value;
  };

  // handlesubmit
  /**{
  "usulan_id": "b0154c5f-8226-4eed-a6c3-83dcf7c228d8",
  "tipe": "D",
  "pns_orang_id": "A5EB04239877F6A0E040640A040252AD",
  "id_riwayat": "AE20670BD626F311E040640A0202096A",
  "tahun_lulus": "2001",
  "nomor_ijazah": "",
  "nama_sek": "",
  "glr_depan": "",
  "keterangan": "sudah ada",
  "glr_belakang": "S.Pd",
  "tgl_tahun_lulus": "",
  "pendidikan_id": "A5EB03E21B68F6A0E040640A040252AD",
  "pendidikan_nama": "A-IV AKUNTANSI",
  "is_pendidikan_pertama": "0",
  "pencantuman_gelar": "",
  "tingkat_pendidikan_id": "40",
  "tingkat_pendidikan_nama": "S-1/Sarjana",
  "dok_transkrip_nilai": null,
  "dok_ijazah": null,
  "dok_sk_pencantuman_gelar": null
} */

  const handleSubmit = async () => {
    const value = await form.validateFields();
    const payload = {
      usulan_id: usulanId,
      tipe: "D",
      pns_orang_id: row?.idPns,
      id_riwayat: row?.id,
      tahun_lulus: value?.tahunLulus || "",
      nomor_ijazah: value?.nomorIjasah || "",
      nama_sek: value?.namaSekolah || "",
      glr_depan: value?.gelarDepan || "",
      glr_belakang: value?.gelarBelakang || "",
      tgl_tahun_lulus: value?.tglLulus || "",
      pendidikan_id: row?.pendidikanId,
      pendidikan_nama: row?.pendidikanNama || "",
      is_pendidikan_pertama: row?.isPendidikanPertama,
      pencantuman_gelar: value?.pencantumanGelar || "",
      tingkat_pendidikan_id: row?.tkPendidikanId || "",
      tingkat_pendidikan_nama: row?.tkPendidikanNama || "",
      dok_transkrip_nilai: null,
      dok_ijazah: null,
      dok_sk_pencantuman_gelar: null,
      keterangan: value?.keterangan || "",
    };

    submit(payload);
  };

  // Helper function untuk boolean conversion
  const formatBoolean = (value) => {
    const result = value === true || value === "1" || value === 1;
    return result;
  };

  // Format data untuk form dengan null values diubah menjadi "-"
  const formattedData = row
    ? {
        ...row,
        nipBaru: formatValue(row.nipBaru),
        nipLama: formatValue(row.nipLama),
        tkPendidikanNama: formatValue(row.tkPendidikanNama),
        pendidikanNama: formatValue(row.pendidikanNama),
        tahunLulus: formatValue(row.tahunLulus),
        tglLulus: formatValue(row.tglLulus),
        nomorIjasah: formatValue(row.nomorIjasah),
        namaSekolah: formatValue(row.namaSekolah),
        gelarDepan: formatValue(row.gelarDepan),
        gelarBelakang: formatValue(row.gelarBelakang),
        path: formatValue(row.path),
      }
    : {};

  return (
    <Modal
      title="Hapus Usulan Pendidikan"
      open={open}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Batal
        </Button>,
        <Button
          loading={submitLoading}
          disabled={submitLoading}
          key="delete"
          type="primary"
          danger
          onClick={handleSubmit}
        >
          Hapus
        </Button>,
      ]}
    >
      <Alert message={`Usulan ID: ${usulanId}`} type="info" />
      <Form form={form} layout="vertical" initialValues={formattedData}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="nipBaru" label="NIP Baru">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="nipLama" label="NIP Lama">
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="tkPendidikanNama" label="Tingkat Pendidikan">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="pendidikanNama" label="Pendidikan">
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="tahunLulus" label="Tahun Lulus">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tglLulus" label="Tanggal Dikeluarkan Ijazah">
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="nomorIjasah" label="Nomor Ijazah">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="namaSekolah" label="Nama Sekolah">
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="gelarDepan" label="Gelar Depan">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="gelarBelakang" label="Gelar Belakang">
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Pendidikan Pertama">
          <Checkbox disabled checked={formatBoolean(row?.isPendidikanPertama)}>
            Pendidikan Pertama
          </Checkbox>
        </Form.Item>

        <Form.Item required name="keterangan" label="Alasan Hapus">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function HapusUsulanPendidikan({ row }) {
  const [showModal, setShowModal] = useState(false);
  const [usulanId, setUsulanId] = useState(null);

  const { mutate: createUsulanPeremajaan, isLoading: loadingCreateUsulan } =
    useMutation({
      mutationFn: createUsulanPeremajaanPendidikan,
      onSuccess: (data) => {
        setShowModal(true);
        setUsulanId(data?.usulan_pendidikan_id);
      },
      onError: (error) => {
        message.error(error.message);
      },
    });

  const handleShowModal = () => {
    createUsulanPeremajaan({
      nip: row?.nipBaru,
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUsulanId(null);
  };

  return (
    <>
      <ModalHapusPendidikan
        open={showModal}
        usulanId={usulanId}
        row={row}
        onCancel={handleCloseModal}
      />
      <Button
        loading={loadingCreateUsulan}
        disabled={loadingCreateUsulan}
        size="small"
        icon={<DeleteOutlined />}
        onClick={handleShowModal}
        type="primary"
        danger
      />
    </>
  );
}

export default HapusUsulanPendidikan;
