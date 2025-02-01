// update data jabatan
import { daftarUpdateJabatan } from "@/utils/master.utils";
import dayjs from "dayjs";

export const searchUpdateJabatan = async (req, res) => {
  try {
    const opdId = "1";
    const tglAwal = req?.query?.tglAwal || dayjs().format("YYYY-MM-DD");
    const tglAkhir = req?.query?.tglAkhir || dayjs().format("YYYY-MM-DD");
    const fetcher = req?.fetcher;
    const result = await daftarUpdateJabatan(opdId, fetcher, tglAwal, tglAkhir);
    console.log(result);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};
