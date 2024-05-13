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
  const isAdmin = user?.current_role === "admin";

  if (!isAdmin) {
    res.status(403).json({ message: "Forbidden" });
  } else {
    const { id, nip } = req.query;
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
