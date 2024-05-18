const {
  riwayatPenghargaan,
  tambahRiwayatPengharggan,
  hapusRiwayatPenghargaan,
} = require("@/utils/siasn-utils");

const handlePenghargaanResponse = async (req, res, nip) => {
  try {
    const fetcher = req?.siasnRequest;
    const data = await riwayatPenghargaan(fetcher, nip);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handlePenghargaanCreate = async (req, res) => {
  try {
    const fetcher = req?.siasnRequest;
    const data = await tambahRiwayatPengharggan(fetcher, req.body);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handlePenghargaanDelete = async (req, res) => {
  try {
    const fetcher = req?.siasnRequest;
    const { id } = req.query;
    const data = await hapusRiwayatPenghargaan(fetcher, id);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPenghargaanPersonal = async (req, res) => {
  const { employeeNumber: nip } = req.user;
  await handlePenghargaanResponse(req, res, nip);
};

const getPenghargaanByNip = async (req, res) => {
  const { nip } = req.query;
  await handlePenghargaanResponse(req, res, nip);
};

const tambahPenghargaanPersonal = async (req, res) => {
  const { employeeNumber: nip } = req.user;
  await handlePenghargaanCreate(req, res, nip);
};

const tambahPenghargaanByNip = async (req, res) => {
  const { nip } = req.query;
  await handlePenghargaanCreate(req, res, nip);
};

const hapusPenghargaanPersonal = async (req, res) => {
  const { employeeNumber: nip } = req.user;
  await handlePenghargaanDelete(req, res, nip);
};

const hapusPenghargaanByNip = async (req, res) => {
  const { nip } = req.query;
  await handlePenghargaanDelete(req, res, nip);
};

module.exports = {
  getPenghargaanPersonal,
  getPenghargaanByNip,
  tambahPenghargaanPersonal,
  tambahPenghargaanByNip,
  hapusPenghargaanPersonal,
  hapusPenghargaanByNip,
};
