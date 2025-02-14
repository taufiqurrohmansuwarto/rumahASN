const SyncPegawai = require("@/models/sync-pegawai.model");
const { downloadDokumenSK } = require("../../utils");
const archiver = require("archiver");

export const downloadSk = async (req, res) => {
  try {
    const type = req?.query?.type || "SK_PELAKSANA25";
    const kebutuhan = req?.query?.kebutuhan || "Pelaksana";

    const { customId, organization_id: organizationId } = req?.user;
    const mc = req.mc;
    const employees = await SyncPegawai.query()
      .where("skpd_id", "ilike", `${organizationId}%`)
      .select("nip_master as nip")
      .andWhere((builder) => {
        if (kebutuhan) {
          builder.where("jenis_jabatan", kebutuhan);
        }
      });

    console.log({ employees: employees?.length });

    const documents = employees.map((employee) => {
      return `${type}_${employee.nip}`;
    });

    const archive = archiver("zip", { zlib: { level: 9 } });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${type}_${kebutuhan}.zip"`
    );
    res.setHeader("Content-Type", "application/zip");

    archive.on("warning", (err) => console.warn(err));
    archive.on("error", (err) => res.status(500).send({ error: err.message }));

    archive.pipe(res);

    for (const doc of documents) {
      try {
        const filename = `${doc}.pdf`;
        console.log({ filename });
        const stream = await downloadDokumenSK(mc, filename);
        archive.append(stream, { name: filename });
      } catch (err) {
        if (err.code === "NoSuchKey") {
          console.log(`${doc}.pdf tidak ditemukan, dilewati.`);
          continue;
        } else {
          console.error(`Gagal mengunduh ${doc}:`, err);
        }
      }
    }

    archive.finalize();
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};
