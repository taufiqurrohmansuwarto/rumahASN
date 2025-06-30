import {
  checkOpdEntrian,
  getFilePath,
  handleError,
  parseCSV,
} from "@/utils/helper/controller-helper";

const SiasnMfa = require("@/models/siasn-mfa.model");

export const syncMfa = async (req, res) => {
  try {
    const knex = SiasnMfa.knex();
    const data = parseCSV(getFilePath("docs-internal/aktivasi.csv"), {
      header: true,
      skipEmptyLines: true,
      delimiter: ",",
      dynamicTyping: false, // Ensure all values are parsed as text
    });

    await knex.delete().from("siasn_mfa");
    await knex.batchInsert("siasn_mfa", data);

    res.json({
      message: "Sync data berhasil",
    });
  } catch (error) {
    handleError(res, error);
  }
};

// [admin]
export const listMfa = async (req, res) => {
  try {
    const { organization_id, current_role } = req?.user;
    let opdId;
    const knex = SiasnMfa.knex();

    if (current_role === "admin") {
      opdId = "1";
    } else {
      opdId = organization_id;
    }

    const {
      skpd_id = opdId,
      aktivasi = "BELUM",
      type = "dashboard",
    } = req?.query;

    const checkOpd = checkOpdEntrian(opdId, skpd_id);

    if (!checkOpd) {
      res.status(403).json({
        message: "Anda tidak memiliki akses ke OPD ini",
      });
    } else {
      if (type === "dashboard") {
        const result = await knex("sync_pegawai as peg")
          .leftJoin("siasn_mfa", "peg.nip_master", "siasn_mfa.nip")
          .where("peg.skpd_id", "ilike", `${skpd_id}%`)
          .select("siasn_mfa.aktivasi")
          .count("peg.nip_master as total")
          .groupBy("siasn_mfa.aktivasi");

        const hasil = result?.map((item) => ({
          title: item?.aktivasi ?? "TIDAK TERDATA",
          value: parseInt(item?.total) || 0,
        }));

        res.json(hasil);
      } else {
        const query = knex("sync_pegawai as peg")
          .leftJoin("siasn_mfa", "peg.nip_master", "siasn_mfa.nip")
          .where("peg.skpd_id", "ilike", `${skpd_id}%`)
          .select(
            "peg.nip_master as nip",
            "peg.nama_master as nama",
            "peg.opd_master as unit_organisasi",
            "peg.status_master as status",
            "siasn_mfa.aktivasi as aktivasi"
          );

        if (aktivasi === "TIDAK TERDATA") {
          query.whereNull("siasn_mfa.aktivasi");
        } else {
          query.where("siasn_mfa.aktivasi", aktivasi);
        }

        const result = await query;

        res.json(result);
      }
    }
  } catch (error) {
    handleError(res, error);
  }
};
