import MejaRegistrasi from "@/models/pengadaan_asn/meja_registrasi.model";
import { toString } from "lodash";
const xlsx = require("xlsx");

export const tandaiPesertaHadir = async (req, res) => {
  try {
    const { noPeserta } = req?.query;
    const { customId } = req?.user;

    if (!noPeserta) {
      res.status(400).json({ message: "No peserta is required" });
    } else {
      await MejaRegistrasi.query().where("nomor_peserta", noPeserta).update({
        status: "hadir",
        updated_by: customId,
      });

      res.status(200).json({ message: "success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const tandaiPesertaTidakHadir = async (req, res) => {
  try {
    const { noPeserta } = req?.query;
    const { customId } = req?.user;

    if (!noPeserta) {
      res.status(400).json({ message: "No peserta is required" });
    } else {
      await MejaRegistrasi.query().where("nomor_peserta", noPeserta).update({
        status: "tidak_hadir",
        updated_by: customId,
      });

      res.status(200).json({ message: "success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const findMejaRegistrasi = async (req, res) => {
  try {
    const { noPeserta: no_peserta } = req?.query;
    const result = await MejaRegistrasi.query()
      .where("nomor_peserta", no_peserta)
      .first();

    if (!result) {
      res.status(404).json({ message: "Data not found" });
    } else {
      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error" });
  }
};

export const findAllMejaRegistrasi = async (req, res) => {
  try {
    const { limit, page, keyword, status } = req?.query;

    const result = await MejaRegistrasi.query()
      .where((builder) => {
        if (keyword) {
          builder.where("nomor_peserta", "like", `%${keyword}%`);
        }
        if (status) {
          builder.where("status", status);
        }
      })
      .page(page - 1, limit);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error" });
  }
};

export const batchInsertMejaRegistrasi = async (req, res) => {
  try {
    const file = req?.file;

    if (!file) {
      res.status(400).json({ message: "File is required" });
    } else {
      // read file from buffer

      const workbook = xlsx.read(file?.buffer);
      const sheet_name_list = workbook.SheetNames;
      const data = xlsx.utils.sheet_to_json(
        workbook.Sheets[sheet_name_list[0]]
      );
      const result = data?.map((d) => ({
        no: toString(d["no"]),
        nomor_peserta: toString(d["nomor_peserta"]),
        nama: toString(d["nama"]),
        lokasi_ujian: toString(d["lokasi_ujian"]),
        jadwal: toString(d["jadwal"]),
        sesi: toString(d["sesi"]),
        jam: toString(d["jam"]),
        meja: toString(d["meja"]),
      }));

      const knex = await MejaRegistrasi.knex();

      //       const xlData = xlsx.utils.sheet_to_json(result);
      await MejaRegistrasi.query().delete();
      knex.batchInsert("seleksi_pengadaan_asn.meja_registrasi", result);
      res.status(200).json({ message: "success" });
    }
  } catch (error) {
    console.log(error);
    trx.rollback();
    res.status(500).json({ message: "Internal server error" });
  }
};
