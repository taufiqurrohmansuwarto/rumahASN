import { checkOpdEntrian, handleError } from "@/utils/helper/controller-helper";
import { createRedisInstance } from "@/utils/redis";

const checkEmployee = async (req, res, next) => {
  try {
    const { organization_id, current_role } = req?.user;
    const { nip } = req?.query;
    const fetcher = req?.fetcher;
    const redis = await createRedisInstance();

    // Validasi NIP
    if (!nip) {
      return res.status(400).json({ code: 400, message: "NIP is required" });
    }

    // Menentukan ID organisasi berdasarkan peran pengguna
    const opdId = current_role === "admin" ? "1" : organization_id;

    // Mendapatkan data pegawai dari cache Redis atau dari API
    const cacheKey = `rasn:employee:${nip}`;
    let employeeData = null;

    // Cek apakah data ada di cache
    const cachedEmployee = await redis.get(cacheKey);

    if (cachedEmployee) {
      employeeData = JSON.parse(cachedEmployee);
    } else {
      // Ambil data dari API jika tidak ada di cache
      try {
        const result = await fetcher.get(
          `/master-ws/operator/employees/${nip}/data-utama-master`
        );

        if (!result) {
          return res
            .status(404)
            .json({ code: 404, message: "Employee not found" });
        }

        employeeData = result?.data;
        // Simpan data ke cache untuk penggunaan berikutnya selama 3 menit
        if (result?.data) {
          await redis.set(cacheKey, JSON.stringify(result.data), "EX", 180);
        }
      } catch (fetchError) {
        return res
          .status(404)
          .json({ code: 404, message: "Employee not found" });
      }
    }

    // Verifikasi akses berdasarkan SKPD pegawai
    const employeeOpdId = employeeData?.skpd?.id;

    if (!employeeOpdId) {
      return res
        .status(404)
        .json({ code: 404, message: "Employee SKPD not found" });
    }

    const hasAccess = checkOpdEntrian(opdId, employeeOpdId);

    if (!hasAccess) {
      return res.status(403).json({ code: 403, message: "Forbidden" });
    }

    // Tambahkan data pegawai ke request untuk digunakan di controller
    req.employeeData = employeeData;

    // Lanjutkan ke middleware berikutnya jika semua pemeriksaan berhasil
    next();
  } catch (error) {
    console.error("Error in checkEmployee middleware:", error);
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error" });
  }
};

export default checkEmployee;
