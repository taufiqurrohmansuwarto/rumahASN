const { z } = require("zod");

/**
 * Contoh data anak:
 * {
 *   id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 *   agamaId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
 *   jenisAnakId: '123e4567-e89b-12d3-a456-426614174000',
 *   jenisKawinId: '223e4567-e89b-12d3-a456-426614174001',
 *   jenisIdDokumenId: '323e4567-e89b-12d3-a456-426614174002',
 *   pnsOrangId: '423e4567-e89b-12d3-a456-426614174003',
 *   nama: 'Budi Santoso',
 *   jenisKelamin: 'L',
 *   tglLahir: '2010-05-15',
 *   statusHidup: 'hidup',
 *   isPns: false,
 *   aktaKelahiran: '1234567890123456',
 *   aktaMeninggal: null,
 *   nomorIdDocument: 'ID123456',
 *   nomorHp: '081234567890',
 *   alamat: 'Jl. Merdeka No. 45, Jakarta',
 *   email: 'budi.santoso@example.com'
 * }
 */
module.exports.createAnakSchema = z.object({
  id: z.string().uuid({ message: "ID anak tidak valid" }).optional(),
  agamaId: z.string().uuid({ message: "ID agama tidak valid" }),
  jenisAnakId: z.string().uuid({ message: "ID jenis anak tidak valid" }),
  jenisKawinId: z.string().uuid({ message: "ID jenis kawin tidak valid" }),
  jenisIdDokumenId: z
    .string()
    .uuid({ message: "ID jenis dokumen tidak valid" }),
  pnsOrangId: z.string().uuid({ message: "ID PNS orang tua tidak valid" }),
  nama: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  jenisKelamin: z.enum(["L", "P"], {
    errorMap: () => ({
      message: "Jenis kelamin harus 'L' (Laki-laki) atau 'P' (Perempuan)",
    }),
  }),
  tglLahir: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Tanggal lahir harus valid dan format YYYY-MM-DD",
    }),
  statusHidup: z.enum(["hidup", "meninggal"], {
    errorMap: () => ({
      message: "Status hidup harus 'hidup' atau 'meninggal'",
    }),
  }),
  isPns: z.boolean({ invalid_type_error: "isPns harus boolean" }),
  aktaKelahiran: z.string().length(16, "Nomor akta kelahiran harus 16 digit"),
  aktaMeninggal: z
    .string()
    .length(16, "Nomor akta meninggal harus 16 digit")
    .nullable()
    .optional(),
  nomorIdDocument: z.string().min(6, "Nomor ID dokumen minimal 6 karakter"),
  nomorHp: z
    .string()
    .regex(/^08\d{8,12}$/, "Nomor HP tidak valid")
    .optional(),
  alamat: z.string().min(10, "Alamat minimal 10 karakter"),
  email: z.string().email("Email tidak valid").optional(),
});

/**
 * Contoh data istri:
 * {
 *   id: 'd4c3b2a1-6f5e-0987-dcba-9876543210fe',
 *   agamaId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
 *   pnsOrangId: '423e4567-e89b-12d3-a456-426614174003',
 *   jenisIdentitas: 'KTP',
 *   nomorIdentitas: '3174123456789012',
 *   nama: 'Siti Aminah',
 *   tanggalLahir: '1985-02-20',
 *   jenisKelamin: 'P',
 *   statusPernikahan: 'menikah',
 *   pasanganKe: 1,
 *   statusPekerjaanPasangan: 'PNS',
 *   alamat: 'Jl. Kebon Kacang No. 7, Jakarta',
 *   email: 'siti.aminah@example.com',
 *   noAktaMenikah: '1234567890123456',
 *   tglAktaMenikah: '2005-06-10',
 *   noAktaCerai: null,
 *   noAktaMeninggal: null
 * }
 */
module.exports.createIstriSchema = z.object({
  id: z.string().uuid({ message: "ID istri tidak valid" }).optional(),
  agamaId: z.string().uuid({ message: "ID agama tidak valid" }),
  pnsOrangId: z.string().uuid({ message: "ID PNS orang tua tidak valid" }),
  jenisIdentitas: z.enum(["KTP", "SIM", "PASPOR"], {
    errorMap: () => ({ message: "Jenis identitas tidak valid" }),
  }),
  nomorIdentitas: z.string().min(6, "Nomor identitas minimal 6 karakter"),
  nama: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  tanggalLahir: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Tanggal lahir harus valid dan format YYYY-MM-DD",
    }),
  jenisKelamin: z.literal("P", {
    errorMap: () => ({ message: "Jenis kelamin istri harus 'P' (Perempuan)" }),
  }),
  statusPernikahan: z.enum(
    ["belum menikah", "menikah", "cerai", "duda", "janda"],
    {
      errorMap: () => ({ message: "Status pernikahan tidak valid" }),
    }
  ),
  pasanganKe: z.number().int().min(1, "Pasangan ke minimal 1"),
  statusPekerjaanPasangan: z
    .string()
    .min(3, "Status pekerjaan pasangan minimal 3 karakter"),
  alamat: z.string().min(10, "Alamat minimal 10 karakter"),
  email: z.string().email("Email tidak valid").optional(),
  noAktaMenikah: z.string().length(16, "Nomor akta menikah harus 16 digit"),
  tglAktaMenikah: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Tanggal akta menikah harus valid dan format YYYY-MM-DD",
    }),
  noAktaCerai: z
    .string()
    .length(16, "Nomor akta cerai harus 16 digit")
    .nullable()
    .optional(),
  noAktaMeninggal: z
    .string()
    .length(16, "Nomor akta meninggal harus 16 digit")
    .nullable()
    .optional(),
});
