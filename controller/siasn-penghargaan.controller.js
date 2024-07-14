const { createLogSIASN } = require("@/utils/logs");
const {
  riwayatPenghargaan,
  tambahRiwayatPengharggan,
  hapusRiwayatPenghargaan,
  dataUtama,
} = require("@/utils/siasn-utils");
const { toNumber } = require("lodash");

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

const handlePenghargaanCreate = async (req, res, nip) => {
  try {
    const fetcher = req?.siasnRequest;
    const pns = await dataUtama(fetcher, nip);
    const payload = {
      ...req.body,
      pnsOrangId: pns?.id,
      tahun: toNumber(req?.body?.tahun),
    };
    const data = await tambahRiwayatPengharggan(fetcher, payload);
    await createLogSIASN({
      userId: req?.user?.customId,
      type: "Tambah Penghargaan",
      siasnService: "siasn-penghargaan",
      employeeNumber: req.query?.nip,
      request_data: JSON.stringify(req.body),
    });
    res.json({ id: data?.data?.mapData?.rwPenghargaanId });
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
    await createLogSIASN({
      userId: req?.user?.customId,
      type: "Hapus Penghargaan",
      siasnService: "siasn-penghargaan",
      employeeNumber: req.query?.nip,
      request_data: JSON.stringify(req.query),
    });
    res.json({
      message: "Berhasil menghapus penghargaan",
    });
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
