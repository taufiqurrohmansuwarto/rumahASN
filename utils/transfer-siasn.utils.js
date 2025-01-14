import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
export const serializeAngkaKredit = (data) => {
  const { selesaiPenilaian, mulaiPenilaian, ...rest } = data;
  const result = {
    ...rest,
    tahun: rest?.tahun ? rest?.tahun?.format("YYYY") : "",
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

  return result;
};
