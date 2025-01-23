import PendataanFasilitator from "@/models/pendataan_fasilitator/fasilitator.model";
import SyncPegawai from "@/models/sync-pegawai.model";
import SyncUnorMaster from "@/models/sync-unor-master.model";
import arrayToTree from "array-to-tree";

export const publicUnorAsn = async (req, res) => {
  try {
    const result = await SyncUnorMaster.query();
    const hasil = result?.map((item) => ({
      title: item?.name,
      value: item?.id,
      id: item?.id,
      pId: item?.pId,
    }));

    const data = arrayToTree(hasil, {
      parentProperty: "pId",
      customID: "id",
    });

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

export const getPegawaiByNip = async (req, res) => {
  try {
    const { nip } = req.query;
    const result = await SyncPegawai.query()
      .select("id", "nama_master", "nip_master")
      .where("nip_master", nip)
      .first();

    if (!result) {
      res.status(404).json({ message: "Data not found" });
    } else {
      res.json(result);
    }
  } catch (error) {
    console.log(error);
    req.status(500).json({ code: 500, message: "Internal server error" });
  }
};

export const postPendataan = async (req, res) => {
  try {
    const { jenis_kepegawaian, nama, asn_id, tipe_pengelola, skpd_id, kode } =
      req.body;

    if (kode !== "fasilitatorjatim2025") {
      res.status(400).json({ code: 400, message: "Kode tidak sesuai" });
    }

    if (asn_id && !nama) {
      const checkDuplicate = await PendataanFasilitator.query()
        .where("asn_id", asn_id)
        .andWhere("skpd_id", skpd_id)
        .andWhere("tipe_pengelola", tipe_pengelola)
        .first();

      if (checkDuplicate) {
        return res.status(409).json({ code: 409, message: "Data sudah ada" });
      }
    }

    if (!asn_id && nama) {
      const checkDuplicate = await PendataanFasilitator.query()
        .where("nama", nama)
        .andWhere("skpd_id", skpd_id)
        .andWhere("tipe_pengelola", tipe_pengelola)
        .first();

      if (checkDuplicate) {
        res.status(409).json({ code: 409, message: "Data sudah ada" });
      }
    }

    await PendataanFasilitator.query().insert({
      jenis_kepegawaian,
      asn_id: asn_id || null,
      nama: nama || null,
      tipe_pengelola,
      skpd_id,
    });

    res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};
