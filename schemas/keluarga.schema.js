const { z } = require("zod");

module.exports.createAnakSchema = z.object({
  nip: z.string(),
  nama: z.string(),
  tanggalLahir: z.string(),
  jenisKelamin: z.string(),
});

module.exports.createIstriSchema = z.object({
  nip: z.string(),
  nama: z.string(),
  tanggalLahir: z.string(),
  jenisKelamin: z.string(),
});
