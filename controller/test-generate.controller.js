import { generateDocument } from "@/utils/toolservice";

export const testGenerate = async (req, res) => {
  try {
    const data = {
      peserta: [
        {
          nama: "iput",
          jabatan: "Kepala Dinas",
        },
        {
          nama: "dodik",
          jabatan: "Kepala Dinas",
        },
      ],
      lokasi: "Jakarta",
      tanggal: "2024-01-01",
      nomor: "1234567890",
      tujuan: "Tujuan",
    };
    const result = await generateDocument(data, req.mc);
    return res.json({ url: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
