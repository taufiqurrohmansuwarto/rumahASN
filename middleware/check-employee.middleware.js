import { checkOpdEntrian } from "@/utils/helper/controller-helper";
import { createRedisInstance } from "@/utils/redis";

const checkEmployee = async (req, res, next) => {
  try {
    const { organization_id, current_role } = req?.user;
    const { nip } = req?.query;
    const fetcher = req?.fetcher;
    const redis = await createRedisInstance();

    // Menentukan ID organisasi berdasarkan peran pengguna
    const opdId = current_role === "admin" ? "1" : organization_id;

    // Mendapatkan data pegawai dari cache Redis atau dari API
    const cacheKey = `employee:${nip}`;
    let employeeData = null;

    // Cek apakah data ada di cache
    const cachedEmployee = await redis.get(cacheKey);

    // Ambil data dari API jika tidak ada di cache
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/data-utama-master`
    );

    if (!result) {
      return res.status(404).json({ code: 404, message: "Employee not found" });
    }

    // Gunakan data dari cache jika tersedia, jika tidak gunakan hasil API
    if (cachedEmployee) {
      employeeData = JSON.parse(cachedEmployee);
    } else {
      employeeData = result?.data;
      // Simpan data ke cache untuk penggunaan berikutnya selama 3 menit
      await redis.set(cacheKey, JSON.stringify(result?.data), "EX", 180);
    }

    // Verifikasi akses berdasarkan SKPD pegawai
    const employeeOpdId = employeeData?.skpd?.id;
    const hasAccess = checkOpdEntrian(opdId, employeeOpdId);

    if (!hasAccess) {
      return res.status(403).json({ code: 403, message: "Forbidden" });
    }

    // Lanjutkan ke middleware berikutnya jika semua pemeriksaan berhasil
    next();
  } catch (error) {
    console.error("Error in checkEmployee middleware:", error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export default checkEmployee;
