import { postPasanganByNip } from "@/services/siasn-services";
import { refAgama, refJenisKawin, statusHidup } from "@/utils/data-utils";
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
  Row,
  Select,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// buat fungsi jika undefined ganti ""

/**
 *
 * @param {format data pasangan dari SIMASTER} value
 * @returns
 *{"suami_istri_id":77922,"pegawai_id":82591,"nama_suami_istri":"RALFATH RITO FARREL ","nik":"1571082810980001","no_bpjs":"0002157649525","status_suami_istri_id":1,"tempat_lahir":"Jambi ","tgl_lahir":"28-09-1998","suami_istri_ke":1,"pekerjaan_id":3,"penghasilan":0,"nip_nrp":"23713/P","instansi":"KOARMADA II ","tunjangan":"Tidak Dapat","file_foto_suami_istri":"https://master.bkd.jatimprov.go.id/files_jatimprov/82591-Suami-20240813-35-WhatsApp_Image_2024-08-01_at_12.10.16_(1).jpeg","file_ktp_suami_istri":"https://master.bkd.jatimprov.go.id/files_jatimprov/82591-ktp-Suami-20240813-383-WhatsApp_Image_2024-08-01_at_12.07.11_(1)_(1).jpeg","file_askes_bpjs_suami_istri":"https://master.bkd.jatimprov.go.id/files_jatimprov/82591-askes_bpjs-Suami-20240813-223-WhatsApp_Image_2024-08-13_at_09.25.27.jpeg","aktif":"Y","tgl_edit":"2024-08-12T17:00:00.000Z","jam_edit":"09:33:52","status_suami_istri":{"status_suami_istri_id":1,"status_suami_istri":"Suami"},"ref_pekerjaan":{"pekerjaan_id":3,"pekerjaan":"TNI"},"nikah":{"nikah_id":90844,"pegawai_id":82591,"status_kawin_id":2,"tgl_nikah_duda_janda":"26-02-2023","no_surat":"1571011022023044","tgl_surat":"26-02-2023","file_surat_nikah_cerai":"https://master.bkd.jatimprov.go.id/files_jatimprov/82591-Menikah-20240701-715-BUKU_NIKAH_SARAH_compressed.pdf","aktif":"Y","tgl_edit":"2024-08-12T17:00:00.000Z","jam_edit":"09:32:09","status_nikah":{"status_kawin_id":2,"status_kawin":"Menikah"}}}
 */

const handleUndefined = (value) => {
  if (value === undefined) return "";
  return value;
};

const ModalPasangan = ({
  isModalOpen,
  handleCancel,
  nip,
  dataPasangan,
  isEdit = false,
}) => {
  const queryClient = useQueryClient();
  const [statusHidupValue, setStatusHidupValue] = useState(null);

  const { mutateAsync: tambahPasangan, isLoading } = useMutation(
    (data) => postPasanganByNip(data),
    {
      onSuccess: () => {
        handleCancel();
        queryClient.invalidateQueries(["data-pasangan-siasn"]);
        form.resetFields();
        message.success("Pasangan berhasil ditambahkan");
      },
      onError: (error) => {
        const msg =
          error?.response?.data?.message || "Pasangan gagal ditambahkan";
        message.error(msg);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["data-pasangan-siasn"]);
      },
    }
  );

  const [form] = Form.useForm();

  useEffect(() => {
    if (dataPasangan) {
      form.setFieldsValue({
        pasanganKe: dataPasangan?.suami_istri_ke || "",
        nomorIdentitas: dataPasangan?.nik || "",
        nama: dataPasangan?.nama_suami_istri || "",
        tglLahir: dataPasangan?.tgl_lahir
          ? dayjs(dataPasangan.tgl_lahir, "DD-MM-YYYY")
          : "",
        noAktaMenikah: dataPasangan?.nikah?.no_surat || "",
        tglAktaMenikah: dataPasangan?.nikah?.tgl_surat
          ? dayjs(dataPasangan.nikah.tgl_surat, "DD-MM-YYYY")
          : "",
      });
    }
  }, [dataPasangan, form]);

  const handleStatusHidupChange = (value) => {
    setStatusHidupValue(value);

    // Jika status hidup meninggal, otomatis set status pernikahan ke cerai mati
    if (value === "0") {
      // Cari ID untuk cerai mati dari refJenisKawin
      const ceraiMatiId = refJenisKawin.find(
        (item) => item.label.toLowerCase() === "cerai mati"
      )?.id;
      if (ceraiMatiId) {
        form.setFieldsValue({ statusPernikahan: ceraiMatiId });
      }
    } else {
      // Reset status pernikahan jika status hidup berubah ke hidup
      form.setFieldsValue({ statusPernikahan: undefined });
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await form.validateFields();
      const hasilValidasi = Object.keys(result).reduce((acc, key) => {
        acc[key] = handleUndefined(result[key]);
        return acc;
      }, {});

      const formatTanggal = (tanggal) =>
        tanggal ? dayjs(tanggal).format("DD-MM-YYYY") : "";

      const payload = {
        nip,
        data: {
          ...hasilValidasi,
          pasanganKe: hasilValidasi.pasanganKe,
          tglLahir: formatTanggal(hasilValidasi.tglLahir),
          tglMeninggal: formatTanggal(hasilValidasi.tglMeninggal),
          tglAktaMenikah: formatTanggal(hasilValidasi.tglAktaMenikah),
        },
      };

      await tambahPasangan(payload);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  // Filter status pernikahan berdasarkan status hidup
  const getFilteredStatusPernikahan = () => {
    if (statusHidupValue === "0") {
      // Jika meninggal, hanya tampilkan cerai mati
      return refJenisKawin.filter(
        (item) => item.label.toLowerCase() === "cerai mati"
      );
    } else {
      // Jika hidup, tampilkan menikah dan cerai hidup
      return refJenisKawin.filter(
        (item) =>
          item.label.toLowerCase() === "menikah" ||
          item.label.toLowerCase() === "cerai hidup"
      );
    }
  };

  return (
    <Modal
      width="90%"
      style={{ maxWidth: 1000 }}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      title={isEdit ? "Edit Pasangan SIASN" : "Tambah Pasangan SIASN"}
      open={isModalOpen}
      onCancel={handleCancel}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(changedValues) => {
          if (changedValues.statusHidup) {
            handleStatusHidupChange(changedValues.statusHidup);
          }
        }}
      >
        {/* Informasi Dasar */}
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="pasanganKe"
              label="Pasangan Ke"
              rules={[{ required: true, message: "Pasangan ke wajib diisi" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="nomorIdentitas"
              label="Nomor Identitas"
              rules={[
                { required: true, message: "Nomor identitas wajib diisi" },
                {
                  pattern: /^[0-9]{16}$/,
                  message: "NIK harus terdiri dari 16 digit angka",
                },
              ]}
            >
              <Input maxLength={16} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="nama"
              label="Nama"
              rules={[{ required: true, message: "Nama wajib diisi" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="tglLahir"
              label="Tanggal Lahir"
              rules={[{ required: true, message: "Tanggal lahir wajib diisi" }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="agamaId"
              label="Agama"
              rules={[{ required: true, message: "Agama wajib diisi" }]}
            >
              <Select showSearch optionFilterProp="children">
                {refAgama.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="statusHidup"
              label="Status Hidup"
              rules={[{ required: true, message: "Status hidup wajib diisi" }]}
            >
              <Select showSearch optionFilterProp="children">
                {statusHidup.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="statusPernikahan"
              label="Status Pernikahan"
              rules={[
                { required: true, message: "Status pernikahan wajib diisi" },
              ]}
            >
              <Select
                showSearch
                optionFilterProp="children"
                disabled={statusHidupValue === "0"} // Disable jika status hidup meninggal
              >
                {getFilteredStatusPernikahan().map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="noAktaMenikah"
              label="No Akta Menikah"
              rules={[
                {
                  required: statusHidupValue === "0",
                  message:
                    "No akta menikah wajib diisi jika status hidup meninggal",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="tglAktaMenikah"
              label="Tanggal Akta Menikah"
              rules={[
                {
                  required: statusHidupValue === "0",
                  message:
                    "Tanggal akta menikah wajib diisi jika status hidup meninggal",
                },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
            </Form.Item>
          </Col>
        </Row>

        {/* Informasi Tambahan jika Meninggal */}
        {statusHidupValue === "0" && (
          <Row gutter={[16, 8]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="tglMeninggal"
                label="Tanggal Meninggal"
                rules={[
                  { required: true, message: "Tanggal meninggal wajib diisi" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="noAktaMeninggal" label="No Akta Meninggal">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Informasi Kontak dan Identitas (Opsional) */}
        <Row gutter={[16, 8]}>
          <Col span={24}>
            <Form.Item name="alamat" label="Alamat">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12}>
            <Form.Item name="email" label="Email">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="noHp" label="No HP">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ModalPasangan;
