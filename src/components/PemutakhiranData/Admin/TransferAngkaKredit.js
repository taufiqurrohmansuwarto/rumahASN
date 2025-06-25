import React, { useEffect } from "react";
import { Modal, Form, message, Spin } from "antd";
import FormAngkaKredit from "./FormAngkaKredit";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { serializeAngkaKredit } from "@/utils/transfer-siasn.utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postRwAngkakreditByNip,
  uploadDokRiwayat,
} from "@/services/siasn-services";

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

function TransferAngkaKredit({ data, onCancel, open, nip, file, loadingFile }) {
  const queryClient = useQueryClient();

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

  const [form] = Form.useForm();

  useEffect(() => {
    if (data) {
      const jenisAk = serializeJenisAK(data);
      form.setFieldsValue(jenisAk);
    }
  }, [data, form]);

  const handleFinish = async () => {
    const values = await form.validateFields();
    const data = serializeAngkaKredit(values);

    const payload = {
      nip,
      data,
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
      <Spin spinning={loadingFile} fullscreen />
      <Modal
        destroyOnClose
        open={open}
        onCancel={onCancel}
        title="Transfer Angka Kredit"
        width={800}
        onOk={handleFinish}
        confirmLoading={isLoadingTambah}
      >
        {data && (
          <>
            <FormAngkaKredit
              jenisPak={data?.jenis_pak_id}
              nip={nip}
              form={form}
            />
            <a href={data?.file_pak} target="_blank" rel="noreferrer">
              {data?.file_pak}
            </a>
          </>
        )}
      </Modal>
    </>
  );
}

export default TransferAngkaKredit;
