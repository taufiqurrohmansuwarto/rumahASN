const { removeJabatan } = require("@/utils/siasn-utils");
const { createLogSIASN } = require("@/utils/logs");

const handleRemoveJabatan = async (req, res, jabatanId) => {
  try {
    const fetcher = req?.siasnRequest;
    console.log(jabatanId);
    const data = await removeJabatan(fetcher, jabatanId);
    res.json({
      message: "Berhasil menghapus jabatan",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const hapusJabatan = async (req, res) => {
  const user = req?.user;

  const { id, nip } = req.query;
  const request = req?.siasnRequest;
  const result = await request.get(`/pns/rw-jabatan/${nip}`);
  const resultPegawai = await request.get(`/pns/data-utama/${nip}`);
  const Pppk = resultPegawai.data.data.kedudukanPnsNama === "PPPK Aktif";

  const { current_role } = user;

  const admin = current_role === "admin";

  // Jika hanya ada satu jabatan atau pegawai adalah PPPK Aktif dan bukan admin, akses dilarang
  if (dataJabatan.length === 1 || (!admin && Pppk)) {
    res.status(403).json({ message: "Forbidden" });
  } else {
    // Log SIASN dan hapus jabatan
    await createLogSIASN({
      userId: user.custom_id,
      type: "delete",
      siasnService: "jabatan",
      employeeNumber: nip,
    });
    await handleRemoveJabatan(req, res, id);
  }
};

module.exports = {
  hapusJabatan,
};
