import { DatePicker, Form, Input, InputNumber, Radio } from "antd";
import { useCallback, useEffect, useState } from "react";
import FormRiwayatJabatanByNip from "../FormRiwayatJabatanByNip";
import FormAngkaKreditKonversi from "./FormAngkaKreditKonversi";

function FormAngkaKredit({ form, nip, type = "transfer", jenisPak }) {
  const [showFieldAngkaKredit, setShowFieldAngkaKredit] = useState(true);
  const [showTahun, setShowTahun] = useState(false);

  const jenisAngkaKredit = form.getFieldValue("jenisAngkaKredit");

  const handleJenisAngkaKreditChange = useCallback(
    (value) => {
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
    },
    [form]
  );

  useEffect(() => {
    handleJenisAngkaKreditChange(jenisAngkaKredit);
  }, [handleJenisAngkaKreditChange, jenisAngkaKredit]);

  const renderKreditFields = useCallback(() => {
    if (!showFieldAngkaKredit) return null;

    return (
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
    );
  }, [showFieldAngkaKredit, type]);

  return (
    <Form form={form} layout="vertical">
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
          disabled={type === "transfer"}
          onChange={(e) => handleJenisAngkaKreditChange(e.target.value)}
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

      {showTahun && (
        <Form.Item required name="tahun" label="Tahun">
          <DatePicker picker="year" disabled={type === "transfer"} />
        </Form.Item>
      )}

      <Form.Item required name="tanggalSk" label="Tanggal SK">
        <DatePicker format="DD-MM-YYYY" disabled={type === "transfer"} />
      </Form.Item>

      <Form.Item required name="mulaiPenilaian" label="Mulai Penilaian">
        <DatePicker picker="month" disabled={type === "transfer"} />
      </Form.Item>

      <Form.Item required name="selesaiPenilaian" label="Selesai Penilaian">
        <DatePicker picker="month" disabled={type === "transfer"} />
      </Form.Item>

      {renderKreditFields()}

      {jenisPak === "1" && (
        <Form.Item required name="kreditBaruTotal" label="Kredit Baru Total">
          <InputNumber disabled={type === "transfer"} />
        </Form.Item>
      )}

      {(jenisPak === "4" || jenisPak === 4) && (
        <FormAngkaKreditKonversi form={form} />
      )}

      <FormRiwayatJabatanByNip nip={nip} name="rwJabatanId" />
    </Form>
  );
}

export default FormAngkaKredit;
