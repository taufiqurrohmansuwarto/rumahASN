import { submitUsulanPeremajaanPendidikan } from "@/services/admin.services";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
} from "antd";
import { Text, Stack } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import ModalKonfirmasiSubmitPendidikan from "./ModalKonfirmasiSubmitPendidikan";

const ModalHapusPendidikan = ({ open, row, onCancel, usulanId }) => {
  const [form] = Form.useForm();

  const { mutate: submit, isLoading: submitLoading } = useMutation(
    (data) => submitUsulanPeremajaanPendidikan(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus pendidikan");
        onCancel();
      },
      onError: (error) => {
        const messageError =
          error?.response?.data?.error || "Internal server error";
        message.error(messageError);
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

  // State untuk modal konfirmasi
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmForm] = Form.useForm();

  const handleShowConfirmModal = async () => {
    try {
      await form.validateFields();
      setShowConfirmModal(true);
    } catch (error) {
      message.error("Lengkapi alasan penghapusan terlebih dahulu");
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      const value = await form.validateFields();
      const confirmValue = await confirmForm.validateFields();

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
        passphrase: confirmValue?.passphrase || "",
        one_time_code: confirmValue?.one_time_code || "",
      };

      submit(payload);
      setShowConfirmModal(false);
      confirmForm.resetFields();
    } catch (error) {
      message.error("Lengkapi passphrase dan OTP");
    }
  };

  return (
    <>
      <Modal
        title={
          <Space>
            <IconTrash size={18} />
            <span>Hapus Usulan Pendidikan</span>
          </Space>
        }
        open={open}
        onCancel={onCancel}
        width={550}
        centered
        okText="Hapus"
        cancelText="Batal"
        okButtonProps={{
          danger: true,
        }}
        onOk={handleShowConfirmModal}
      >
        <Stack spacing="xs" style={{ marginBottom: 12 }}>
          <Text size="xs" c="dimmed">
            ID: {usulanId}
          </Text>
        </Stack>

        <Form
          form={form}
          layout="vertical"
          initialValues={formattedData}
          size="small"
        >
          <Row gutter={12}>
            <Col span={10}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                NIP
              </Text>
              <Form.Item name="nipBaru" style={{ marginBottom: 0 }}>
                <Input disabled size="small" />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                Pendidikan
              </Text>
              <Form.Item name="pendidikanNama" style={{ marginBottom: 0 }}>
                <Input disabled size="small" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12} style={{ marginTop: 8 }}>
            <Col span={18}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                Sekolah
              </Text>
              <Form.Item name="namaSekolah" style={{ marginBottom: 0 }}>
                <Input disabled size="small" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                Tahun
              </Text>
              <Form.Item name="tahunLulus" style={{ marginBottom: 0 }}>
                <Input disabled size="small" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 12, marginTop: 8 }}>
            <Checkbox disabled checked={formatBoolean(row?.isPendidikanPertama)}>
              <Text size="xs">Pendidikan Pertama</Text>
            </Checkbox>
          </Form.Item>

          <Form.Item
            required
            name="keterangan"
            rules={[{ required: true, message: "Wajib diisi" }]}
            style={{ marginBottom: 0 }}
          >
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Alasan Penghapusan
            </Text>
            <Input.TextArea rows={3} placeholder="Jelaskan alasan penghapusan..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Konfirmasi Submit */}
      <ModalKonfirmasiSubmitPendidikan
        open={showConfirmModal}
        onCancel={() => {
          setShowConfirmModal(false);
          confirmForm.resetFields();
        }}
        onOk={handleConfirmSubmit}
        loading={submitLoading}
        form={confirmForm}
      />
    </>
  );
};

export default ModalHapusPendidikan;

