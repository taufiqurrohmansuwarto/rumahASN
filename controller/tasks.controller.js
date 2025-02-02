// update data jabatan
import { daftarUpdateJabatan } from "@/utils/master.utils";
import dayjs from "dayjs";

export const searchUpdateJabatan = async (req, res) => {
  try {
    const current_role = req?.user?.current_role;
    let opdId = "1";

    const tglAwal = req?.query?.tgl_awal || dayjs().format("YYYY-MM-DD");
    const tglAkhir = req?.query?.tgl_akhir || dayjs().format("YYYY-MM-DD");
    const fetcher = req?.fetcher;
    const result = await daftarUpdateJabatan(opdId, fetcher, tglAwal, tglAkhir);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};
