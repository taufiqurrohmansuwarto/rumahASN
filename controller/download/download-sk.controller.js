const SyncPegawai = require("@/models/sync-pegawai.model");
const { downloadDokumenSK, checkFileMinioSK } = require("../../utils");
const archiver = require("archiver");

// Konstanta untuk dokumen administrasi
const DOKUMEN_ADMINISTRASI = [
  { code: "SK", name: "SK", fullName: "Surat Keputusan" },
  { code: "PERTEK", name: "PERTEK", fullName: "Pertimbangan Teknis" },
  {
    code: "SPMT",
    name: "SPMT",
    fullName: "Surat Pernyataan Melaksanakan Tugas",
  },
  { code: "PK", name: "PK", fullName: "Perjanjian Kinerja" },
];

// Konstanta untuk TMT
const LIST_TMT = [
  { value: "01032019", label: "1 Mar 2019" },
  { value: "01022022", label: "1 Feb 2022" },
  { value: "01042024", label: "1 Apr 2024" },
  { value: "01052024", label: "1 Mei 2024" },
  { value: "01062024", label: "1 Jun 2024" },
  { value: "01072024", label: "1 Jul 2024" },
  { value: "01082024", label: "1 Ags 2024" },
  { value: "01012025", label: "1 Jan 2025" },
  { value: "01032025", label: "1 Mar 2025" },
  { value: "01062025", label: "1 Jun 2025" },
  { value: "01072025", label: "1 Jul 2025" },
  { value: "01082025", label: "1 Ags 2025" },
  { value: "01102025", label: "1 Okt 2025" },
  { value: "01012026", label: "1 Jan 2026" },
];

const MAX_EMPLOYEES = 1000;

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

/**
 * Download dokumen administrasi (SK, PERTEK, SPMT, PK) berdasarkan TMT dan OPD
 * Query params:
 * - opd_id: ID OPD (optional, default: req.user.organization_id)
 * - tmt: TMT dalam format DDMMYYYY, contoh: "01012025" (required)
 * - file: Jenis dokumen (SK, PERTEK, SPMT, PK) (required)
 */
export const downloadDokumenAdministrasi = async (req, res) => {
  try {
    const { organization_id: userOpdId } = req?.user || {};
    const { opd_id: queryOpdId, tmt, file: fileType } = req.query;

    // Default opd_id dari user, bisa di-override dari query
    const opdId = queryOpdId || userOpdId;

    // Validasi opd_id wajib
    if (!opdId) {
      return res.status(400).json({
        code: 400,
        message:
          "Parameter opd_id wajib diisi atau user harus memiliki organization_id",
      });
    }

    // Validasi tmt wajib
    if (!tmt) {
      return res.status(400).json({
        code: 400,
        message: "Parameter tmt wajib diisi",
      });
    }

    const validTmt = LIST_TMT.find((t) => t.value === tmt);
    if (!validTmt) {
      return res.status(400).json({
        code: 400,
        message: `TMT tidak valid. TMT yang tersedia: ${LIST_TMT.map(
          (t) => t.value
        ).join(", ")}`,
      });
    }

    // Validasi file type wajib
    if (!fileType) {
      return res.status(400).json({
        code: 400,
        message: "Parameter file wajib diisi",
      });
    }

    const validFileType = DOKUMEN_ADMINISTRASI.find((d) => d.code === fileType);
    if (!validFileType) {
      return res.status(400).json({
        code: 400,
        message: `Jenis dokumen tidak valid. Jenis yang tersedia: ${DOKUMEN_ADMINISTRASI.map(
          (d) => d.code
        ).join(", ")}`,
      });
    }

    const mc = req.mc;

    // Query pegawai berdasarkan OPD - hanya ambil NIP untuk Set lookup
    const employees = await SyncPegawai.query()
      .where("skpd_id", "ilike", `${opdId}%`)
      .select("nip_master as nip");

    // Cek jumlah pegawai
    if (employees.length > MAX_EMPLOYEES) {
      return res.status(400).json({
        code: 400,
        message: `Jumlah pegawai (${employees.length}) melebihi batas maksimal ${MAX_EMPLOYEES}. Silakan filter berdasarkan jenis jabatan atau pilih OPD yang lebih spesifik.`,
      });
    }

    if (employees.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "Tidak ada pegawai ditemukan untuk OPD ini",
      });
    }

    // Buat Set dari NIP untuk lookup cepat O(1)
    const employeeNipSet = new Set(employees.map((e) => e.nip));

    // OPTIMASI: Gunakan listObjects untuk list semua file dengan prefix
    // Ini jauh lebih cepat daripada mencoba download satu-satu
    const prefix = `sk_pns/${fileType}_${tmt}_`;
    const existingFiles = [];

    // List semua file yang ada dengan prefix
    const listStream = mc.listObjects("bkd", prefix, false);
    for await (const obj of listStream) {
      // Extract NIP dari nama file: SK_01012025_199001011990011001.pdf -> 199001011990011001
      const filename = obj.name.replace(prefix, "").replace(".pdf", "");
      // Cek apakah NIP ini ada di daftar pegawai OPD
      if (employeeNipSet.has(filename)) {
        existingFiles.push({ name: obj.name, nip: filename });
      }
    }

    // Download hanya file yang ada secara parallel
    const BATCH_SIZE = 20;
    const allFiles = [];

    for (let i = 0; i < existingFiles.length; i += BATCH_SIZE) {
      const batch = existingFiles.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (file) => {
          try {
            const stream = await mc.getObject("bkd", file.name);
            const chunks = [];
            for await (const chunk of stream) {
              chunks.push(chunk);
            }
            return { nip: file.nip, buffer: Buffer.concat(chunks) };
          } catch (err) {
            console.error(`Gagal download ${file.name}:`, err.message);
            return null;
          }
        })
      );
      allFiles.push(...results.filter(Boolean));
    }

    if (allFiles.length === 0) {
      return res.status(404).json({
        code: 404,
        message: `Tidak ada dokumen ${fileType} dengan TMT ${tmt} yang ditemukan untuk OPD ini`,
      });
    }

    // Setup archiver dengan kompresi rendah (lebih cepat)
    const archive = archiver("zip", { zlib: { level: 1 } });

    const filename = `dokumen_${fileType}_${tmt}.zip`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/zip");

    archive.on("warning", (err) => console.warn(err));
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      if (!res.headersSent) {
        res.status(500).send({ error: err.message });
      }
    });

    archive.pipe(res);

    // Tambahkan file dari buffer (sangat cepat)
    for (const file of allFiles) {
      const archiveFilename = `${fileType}_${tmt}_${file.nip}.pdf`;
      archive.append(file.buffer, { name: archiveFilename });
    }

    console.log(
      `Download ${fileType}_${tmt}: ${allFiles.length} files ditemukan (dari ${existingFiles.length} file di MinIO, ${employees.length} pegawai OPD)`
    );

    archive.finalize();
  } catch (error) {
    console.error("Error in downloadDokumenAdministrasi:", error);
    if (!res.headersSent) {
      res.status(500).json({ code: 500, message: "Internal Server Error" });
    }
  }
};
