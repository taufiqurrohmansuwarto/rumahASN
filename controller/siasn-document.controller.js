const FormData = require("form-data");

const uplaodDokRwSIASN = async (req, res) => {
  try {
    const body = req?.body;
    const request = req?.siasnRequest;
    const file = req?.file;
    const id_ref_dokumen = req?.body?.id_ref_dokumen;
    const id_riwayat = req?.body?.id_riwayat;

    const form = new FormData();
    form.append("file", file.buffer, file.originalname);
    form.append("id_ref_dokumen", id_ref_dokumen);
    form.append("id_riwayat", id_riwayat);

    const response = await request.post("/upload-dok-rw", form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    res.json({
      message: "Berhasil upload dokumen",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  uplaodDokRwSIASN,
};
