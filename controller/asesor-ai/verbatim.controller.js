import VerbatimSessions from "@/models/verbatim-ai/verbatim-sessions.model";
import VerbatimAudioFiles from "@/models/verbatim-ai/verbatim-audio-files.model";

import { handleError } from "@/utils/helper/controller-helper";

const splitRekamanVerbatim = (file) => {
  const rekaman = file.split("\n");
  return rekaman;
};

const transkripRekamanVerbatim = (rekaman) => {
  const transkrip = rekaman.map((item) => {
    const [tanggal, waktu, nama, keterangan] = item.split("|");
    return { tanggal, waktu, nama, keterangan };
  });
  return transkrip;
};

const pisahPercakapanVerbatim = (transkrip) => {
  const percakapan = transkrip.map((item) => {
    const [tanggal, waktu, nama, keterangan] = item.split("|");
    return { tanggal, waktu, nama, keterangan };
  });
  return percakapan;
};

const analisisRekamanVerbatim = (percakapan) => {
  const analisis = percakapan.map((item) => {
    const [tanggal, waktu, nama, keterangan] = item.split("|");
    return { tanggal, waktu, nama, keterangan };
  });
  return analisis;
};

const exportRekamanVerbatim = (analisis) => {
  const exportRekaman = analisis.map((item) => {
    const [tanggal, waktu, nama, keterangan] = item.split("|");
    return { tanggal, waktu, nama, keterangan };
  });
  return exportRekaman;
};

export const uploadRekamanVerbatim = async (req, res) => {
  try {
    const { file } = req;
    const { id } = req.query;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }
  } catch (error) {
    handleError(error, res);
  }
};
