/**
 *
 * @param {*} nip
 * disparitas data meliputi
 * 1. SKP 2 tahun terakhir
 * 2. Jabatan
 * 3. Unit Organisasi
 * 4. Nama, NIP, dan Tanggal Lahir
 * 5. Pangkat
 * 6. Masa Kerja
 *
 * attribut object jenis, keterangan
 */
const checkDisparitas = async (nip) => {
  // disparitas data meliputi
};

export const getDisparitas = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getDisparitasByNip = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
