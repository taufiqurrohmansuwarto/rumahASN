const SiasnPengadaanProxy = require("@/models/siasn-pengadaan-proxy.model");
const axios = require("axios");
const dayjs = require("dayjs");
const { TemplateHandler } = require("easy-template-x");
const { trim } = require("lodash");
const archiver = require("archiver");
const FILE_SK = "FORMAT_SK_CPNS_2024";

const generateDokumenSKPengadaan = async (req, res) => {
  try {
    const { tahun = 2025, jenis_pengadaan = "SK" } = req?.query;
    const knex = SiasnPengadaanProxy.knex();

    // Get data from database
    const results = await fetchPengadaanData(knex, tahun);

    if (!results || results.length === 0) {
      return res.status(404).json({
        message: "Data tidak ditemukan",
      });
    }

    // Get template file
    const wordFormat = await fetchTemplateFile();

    // Create archive
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Set response headers
    setResponseHeaders(res, tahun);

    // Pipe archive to response
    archive.pipe(res);

    // Process each record and add to archive
    for (const data of results) {
      const templateData = prepareTemplateData(data);
      const docxResult = await processTemplate(wordFormat.data, templateData);
      const fileName = `SK_CPNS_${data.nip || data.no_peserta}.docx`;
      archive.append(docxResult, { name: fileName });
    }

    // Finalize archive
    archive.finalize();
  } catch (error) {
    console.error("Error generating SK documents:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat generate dokumen SK",
      error: error.message,
    });
  }
};

// Helper functions
const fetchPengadaanData = async (knex, tahun) => {
  return knex("siasn_pengadaan_proxy as sp")
    .where("sp.periode", tahun)
    .leftJoin("ref_siasn.status_usul as rsu", "sp.status_usulan", "rsu.id")
    .leftJoin(
      knex.raw(`(
          SELECT DISTINCT ON (id_siasn) id_siasn, id_simaster
          FROM rekon.unor
          ORDER BY id_siasn, id_simaster
        ) as ru`),
      knex.raw("sp.usulan_data->'data'->>'unor_id'"),
      "ru.id_siasn"
    )
    .select(
      knex.raw("ROW_NUMBER() OVER (ORDER BY sp.nip) as no_urut"),
      "sp.id",
      "sp.nip",
      "sp.nama",
      "sp.no_pertek",
      "sp.path_ttd_pertek",
      "sp.jenis_formasi_nama",
      knex.raw("sp.usulan_data->'data'->>'no_peserta' as no_peserta"),
      knex.raw("sp.usulan_data->'data'->>'tahun_lulus' as tahun_lulus"),
      knex.raw(
        "sp.usulan_data->'data'->>'pendidikan_pertama_nama' as pendidikan"
      ),
      knex.raw("sp.usulan_data->'data'->>'gaji_pokok' as gaji_pokok"),
      knex.raw("sp.usulan_data->'data'->>'unor_nama' as unit_kerja_pertek"),
      knex.raw("sp.usulan_data->'data'->>'tempat_lahir' as tempat_lahir"),
      knex.raw("sp.usulan_data->'data'->>'tgl_lahir' as tgl_lahir"),
      knex.raw("sp.usulan_data->'data'->>'golongan_nama' as pangkat"),
      knex.raw(
        "sp.usulan_data->'data'->>'jabatan_fungsional_umum_nama' as jfu"
      ),
      knex.raw("sp.usulan_data->'data'->>'jabatan_fungsional_nama' as jft"),
      knex.raw(
        "sp.usulan_data->'data'->>'jenis_jabatan_nama' as jenis_jabatan_nama"
      ),
      knex.raw(
        "sp.usulan_data->'data'->>'pendidikan_ijazah_nama' as pendidikan_ijazah_nama"
      ),
      knex.raw(
        "sp.usulan_data->'data'->>'pendidikan_pertama_nama' as pendidikan_pertama_nama"
      ),
      knex.raw("sp.usulan_data->'data'->>'golongan_nama' as golongan_nama"),
      knex.raw(
        "get_hierarchy_siasn(sp.usulan_data->'data'->>'unor_id') as unor_siasn"
      ),
      knex.raw(
        "CASE WHEN ru.id_simaster IS NOT NULL THEN get_hierarchy_simaster(ru.id_simaster) ELSE NULL END as unor_simaster"
      ),
      "rsu.id as status_usulan_id",
      "rsu.nama as status_usulan_nama"
    )
    .where("sp.periode", tahun)
    .whereIn("sp.jenis_formasi_id", ["0101", "0102", "0103", "0104"])
    .where("sp.status_usulan", "22");
};

const fetchTemplateFile = async () => {
  const urlDocx = `https://siasn.bkd.jatimprov.go.id:9000/public/${FILE_SK}.docx`;
  return axios.get(urlDocx, {
    responseType: "arraybuffer",
  });
};

function getGenderFromNIP(nip) {
  // Validasi panjang dan format
  if (typeof nip !== "string" || !/^\d{18}$/.test(nip)) {
    return "Invalid";
  }

  // Digit ke-15 (index 14) menentukan jenis kelamin: 1=Laki-laki, 2=Perempuan
  const genderCode = nip.charAt(14);
  if (genderCode === "1") return "Laki-laki";
  if (genderCode === "2") return "Perempuan";
  return "Invalid";
}

const formatGajiPokok = (gajiPokok) => {
  //  2465000 ->  2.465.000
  return gajiPokok.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
  });
};

const prepareTemplateData = (data) => {
  const templateData = {
    nama: trim(data.nama || ""),
    nip: data.nip || "",
    pangkat: data.pangkat || "",
    no_urut: data.no_urut || "",
    no_pertek: data.no_pertek || "",
    no_peserta: data.no_peserta || "",
    tahun_lulus: data.tahun_lulus || "",
    tempat_lahir: data.tempat_lahir || "",
    tgl_lahir: data.tgl_lahir ? dayjs(data.tgl_lahir).format("DD-MM-YYYY") : "",
    pendidikan:
      data.pendidikan_ijazah_nama || data.pendidikan_pertama_nama || "",
    golongan: data.golongan_nama || "",
    gaji_pokok: data.gaji_pokok ? formatGajiPokok(data.gaji_pokok) : "",
    gaji_pokok_calculated: data.gaji_pokok
      ? formatGajiPokok(data.gaji_pokok * 0.8)
      : "",
    unit_kerja_pertek: data.unit_kerja_pertek || "",
    jenis_formasi: data.jenis_formasi_nama || "",
    tanggal_sk: dayjs().format("DD-MM-YYYY"),
    jabatan:
      data?.jenis_jabatan_nama === "Jabatan Fungsional Umum"
        ? data?.jfu
        : data?.jft,
    jenis_kelamin: getGenderFromNIP(data.nip),
  };

  // Add font size property for fields that might exceed 35 characters
  const fieldsToCheck = [
    "nama",
    "unit_kerja_pertek",
    "jabatan",
    "pendidikan",
    "jenis_formasi",
  ];

  fieldsToCheck.forEach((field) => {
    if (templateData[field] && templateData[field].length > 35) {
      templateData[`${field}_fontSize`] = 10;
    } else {
      templateData[`${field}_fontSize`] = 11; // Default font size
    }
  });

  return templateData;
};

const processTemplate = async (templateBuffer, data) => {
  const template = new TemplateHandler();
  return template.process(templateBuffer, data);
};

const setResponseHeaders = (res, tahun) => {
  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=SK_CPNS_${tahun}.zip`
  );
};

module.exports = {
  generateDokumenSKPengadaan,
};
