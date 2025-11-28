// Daftar dokumen penting yang harus ada di SIASN
export const dokumenPenting = [
  {
    key: "drh",
    label: "Daftar Riwayat Hidup",
    siasnCode: "24",
    useCVProxy: true,
  },
  { key: "file_pns", label: "SK PNS", siasnCode: "887" },
  { key: "file_spmt_cpns", label: "SPMT", siasnCode: "888" },
  { key: "file_cpns", label: "SK CPNS", siasnCode: "889" },
  {
    key: "file_pertek",
    label: "Pertimbangan Teknis BKN",
    siasnCode: "2",
    sourceOptions: [
      { key: "file_nota_persetujuan_bkn", label: "Nota BKN" },
      { key: "file_cpns", label: "SK CPNS" },
    ],
  },
];

// Daftar dokumen pendukung lainnya
export const dokumenLainnya = [
  { key: "file_foto", label: "Foto" },
  { key: "file_foto_full", label: "Foto Full" },
  { key: "file_akta_kelahiran", label: "Akta Kelahiran" },
  { key: "file_ktp", label: "KTP" },
  { key: "file_ksk", label: "Kartu Keluarga" },
  { key: "file_karpeg", label: "Karpeg" },
  { key: "file_kpe", label: "KPE" },
  { key: "file_askes_bpjs", label: "BPJS Kesehatan" },
  { key: "file_taspen", label: "Taspen" },
  { key: "file_karis_karsu", label: "Karis/Karsu" },
  { key: "file_npwp", label: "NPWP" },
  { key: "file_konversi_nip", label: "Konversi NIP" },
  { key: "file_sumpah_pns", label: "Sumpah PNS" },
  { key: "file_nota_persetujuan_bkn", label: "Nota BKN" },
  { key: "file_kartu_taspen", label: "Kartu Taspen" },
  { key: "file_kartu_asn_virtual", label: "Kartu ASN Virtual" },
];

