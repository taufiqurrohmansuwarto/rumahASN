const FormData = require("form-data");
const { createLogSIASN } = require("@/utils/logs");

const uplaodDokRwSIASN = async (req, res) => {
  try {
    const { id_riwayat, id_ref_dokumen } = req?.body;
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

    await createLogSIASN({
      userId: req?.user?.customId,
      employeeNumber: null,
      siasnService: "upload-dok-rw",
      type: "CREATE",
      request_data: JSON.stringify({
        id_riwayat,
        id_ref_dokumen,
      }),
    });

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
