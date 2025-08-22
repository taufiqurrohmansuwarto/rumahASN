const {
  removeJabatan,
  syncJabatanSIASN,
  dataUtama,
  syncGolonganSIASN,
} = require("@/utils/siasn-utils");
const { createLogSIASN } = require("@/utils/logs");

const handleRemoveJabatan = async (req, res, jabatanId) => {
  try {
    const fetcher = req?.siasnRequest;
    await removeJabatan(fetcher, jabatanId);
    res.json({
      message: "Berhasil menghapus jabatan",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const hapusJabatan = async (req, res) => {
  try {
    const user = req?.user;

    const { id, nip } = req.query;
    const request = req?.siasnRequest;
    const result = await request.get(`/pns/rw-jabatan/${nip}`);
    const resultPegawai = await request.get(`/pns/data-utama/${nip}`);
    const Pppk = resultPegawai.data.data.kedudukanPnsNama === "PPPK Aktif";

    const { current_role } = user;

    const admin = current_role === "admin";

    const dataJabatan = result.data.data;

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
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

const syncJabatan = async (req, res) => {
  try {
    const fetcher = req?.siasnRequest;
    const result = await fetcher.get(`/data-utama-jabatansync`);
    res.json(result);
  } catch (error) {
    console.log(error);
  }
};

const syncJabatanByNip = async (req, res) => {
  try {
    const fetcher = req?.siasnRequest;
    const { nip } = req.query;
    const hasil = await dataUtama(fetcher, nip);
    const pnsId = hasil?.id;
    const result = await syncJabatanSIASN(fetcher, pnsId);
    const msg = result?.Message || "success";
    res.json({ message: msg });
  } catch (error) {
    console.log(error);
  }
};

const syncGolongan = async (req, res) => {
  try {
    const fetcher = req?.siasnRequest;
    const result = await fetcher.get(`/data-utama-golongansync`);
    res.json(result);
  } catch (error) {
    console.log(error);
  }
};

const syncGolonganByNip = async (req, res) => {
  try {
    const fetcher = req?.siasnRequest;
    const { nip } = req.query;
    const hasil = await dataUtama(fetcher, nip);
    const pnsId = hasil?.id;
    const result = await syncGolonganSIASN(fetcher, pnsId);
    const msg = result?.Message || "success";
    res.json({ message: msg });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  hapusJabatan,
  syncJabatan,
  syncJabatanByNip,
  syncGolongan,
  syncGolonganByNip,
};
