import { useQueryClient } from "@tanstack/react-query";
import { DatePicker, Form, Input, InputNumber, Modal, Radio } from "antd";
import { useState } from "react";
import FormRiwayatJabatanByNip from "../FormRiwayatJabatanByNip";

function FormAngkaKredit({ form, nip, type = "transfer" }) {
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  const [fileList, setFileList] = useState([]);

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

  const handleConfirmModal = () => {
    Modal.confirm({
      centered: true,
      title: "Apakah anda yakin?",
      content: `Mohon pastikan semua data dan dokumen yang Anda masukkan selalu terkini dan akurat. Ketidaksesuaian informasi bisa berdampak pada proses layanan kepegawaian pegawai. Ingat, setiap entri data akan dicatat dan dipertanggungjawabkan melalui sistem log Rumah ASN.`,
      okText: "Ya",
      cancelText: "Tidak",
      onOk: async () => await onFinish(),
    });
  };

  const [showFieldAngkaKredit, setShowFieldAngkaKredit] = useState(true);
  const [showTahun, setShowTahun] = useState(false);

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name={"jenisAngkaKredit"}
        label={"Jenis Angka Kredit"}
        required
        rules={[
          {
            required: true,
            message: "Pilih Jenis Angka Kredit",
          },
        ]}
      >
        <Radio.Group
          disabled={type === "transfer"}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "isKonversi") {
              setShowFieldAngkaKredit(false);
              setShowTahun(true);
              form.setFieldsValue({
                kreditUtamaBaru: "",
                kreditPenunjangBaru: "",
              });
            } else if (value === "isIntegrasi") {
              setShowTahun(false);
              setShowFieldAngkaKredit(false);
              form.setFieldsValue({
                tahun: "",
                kreditUtamaBaru: "",
                kreditPenunjangBaru: "",
              });
            } else {
              setShowTahun(false);
              setShowFieldAngkaKredit(true);
              form.setFieldsValue({
                tahun: "",
              });
            }
          }}
        >
          <Radio.Button value="isAngkaKreditPertama">
            Angka Kredit Pertama?
          </Radio.Button>
          <Radio.Button value="isIntegrasi">Integrasi</Radio.Button>
          <Radio.Button value="isKonversi">Konversi</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item required name="nomorSk" label="Nomor SK">
        <Input disabled={type === "transfer"} />
      </Form.Item>
      {showTahun ? (
        <Form.Item required name="tahun" label="Tahun">
          <DatePicker picker="year" disabled={type === "transfer"} />
        </Form.Item>
      ) : null}
      <Form.Item required name="tanggalSk" label="Tanggal SK">
        <DatePicker format={"DD-MM-YYYY"} disabled={type === "transfer"} />
      </Form.Item>
      <Form.Item required name="mulaiPenilaian" label="Mulai Penilaian">
        <DatePicker picker="month" disabled={type === "transfer"} />
      </Form.Item>
      <Form.Item required name="selesaiPenilaian" label="Selesai Penilaian">
        <DatePicker picker="month" disabled={type === "transfer"} />
      </Form.Item>
      {showFieldAngkaKredit ? (
        <>
          <Form.Item required name="kreditUtamaBaru" label="Kredit Utama Baru">
            <InputNumber disabled={type === "transfer"} />
          </Form.Item>
          <Form.Item
            name="kreditPenunjangBaru"
            label="Kredit Penunjang Baru"
            required
          >
            <InputNumber disabled={type === "transfer"} />
          </Form.Item>
        </>
      ) : null}
      <Form.Item
        required
        name="kreditBaruTotal"
        label="Kredit Baru Total"
        help="Untuk Konversi entri Jumlah nilai PAK Konversi (lembar/lampiran ke-2)"
      >
        <InputNumber disabled={type === "transfer"} />
      </Form.Item>
      <FormRiwayatJabatanByNip nip={nip} name="rwJabatanId" />
    </Form>
  );
}

export default FormAngkaKredit;
