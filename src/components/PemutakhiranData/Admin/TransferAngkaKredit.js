import React, { useEffect } from "react";
import { Modal, Form } from "antd";
import FormAngkaKredit from "./FormAngkaKredit";
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
      jenisAngkaKredit: "isKonversi",
    };
  }

  return payload;
};

function TransferAngkaKredit({ data, onCancel, open, nip }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (data) {
      const jenisAk = serializeJenisAK(data);
      form.setFieldsValue(jenisAk);
    }
  }, [data, form]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Transfer Angka Kredit"
      footer={null}
      width={800}
    >
      <FormAngkaKredit nip={nip} form={form} />
    </Modal>
  );
}

export default TransferAngkaKredit;
