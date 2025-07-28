const FormData = require("form-data");

const uplaodDokRwSIASN = async (req, res) => {
  try {
    const { id_riwayat, id_ref_dokumen } = req?.body;
    console.log({
      id_riwayat,
      id_ref_dokumen,
    });
    const request = req?.siasnRequest;
    const file = req?.file;

    const form = new FormData();
    form.append("file", file.buffer, file.originalname);
    form.append("id_ref_dokumen", id_ref_dokumen);
    form.append("id_riwayat", id_riwayat);

    const response = await request.post("/upload-dok-rw", form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    const responseMessage =
      response?.data?.message || "Berhasil Upload Dokumen";
    res.json(responseMessage);
  } catch (error) {
    console.log("error", error);
    const errorMessage = error?.message || "Internal server error";
    console.log(errorMessage);
    res.status(500).json({ message: errorMessage });
  }
};

module.exports = {
  uplaodDokRwSIASN,
};
