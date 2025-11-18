const FormData = require("form-data");
const { getDataProfileDMS } = require("@/utils/dms-utils");
const { logger } = require("@/utils/logger");
const { uploadDokumenSiasn } = require("@/utils/siasn-utils");
const SiasnEmployee = require("@/models/siasn-employees.model");
const { handleError } = require("@/utils/helper/controller-helper");

const kodeDokumen = {
  887: "SK PNS",
  888: "SK CPNS",
  889: "SPMT CPNS",
};

export const unggahDokumenSiasn = async (req, res) => {
  try {
    const file = req?.file;
    const request = req?.siasnRequest;
    const { id_ref_dokumen, id_riwayat } = req?.body;
    logger.info(req?.file);
    logger.info(`Upload dokumen SIASN: ${id_ref_dokumen} ${id_riwayat}`);

    const result = await uploadDokumenSiasn(
      request,
      file,
      id_ref_dokumen,
      id_riwayat
    );
    logger.info("success upload dokumen", result);
    res.json({
      message: "Berhasil upload dokumen",
      data: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const uploadDokumenSiasnController = async (req, res) => {
  try {
    const file = req?.file;
    const { nip } = req?.query;
    const request = req?.siasnRequest;
    const { id_ref_dokumen } = req?.body;

    const currentEmployee = await SiasnEmployee.query()
      .where("nip_baru", nip)
      .first();

    if (!currentEmployee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Buat nama file custom berdasarkan jenis dokumen
    let fileName = file.originalname;
    const idRefDokumenStr = String(id_ref_dokumen);

    if (kodeDokumen[idRefDokumenStr]) {
      const fileExtension = file.originalname.split(".").pop();
      fileName = `${nip}_${kodeDokumen[idRefDokumenStr]}.${fileExtension}`;
    }

    // Buat FormData dengan buffer dan nama file custom
    const formData = new FormData();
    formData.append("file", file.buffer, {
      filename: fileName,
      contentType: file.mimetype,
    });
    formData.append("pns_id", currentEmployee?.pns_id);
    formData.append("id_ref_dokumen", id_ref_dokumen);

    // Upload ke SIASN
    const result = await uploadDokumenSiasn(request, formData);

    res.json({
      message: "Berhasil upload dokumen",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: error?.message || "Internal Server Error" });
  }
};

// untuk dms
export const getDMSProfileController = async (req, res) => {
  try {
    const { nip } = req?.query;
    const token = req?.token;
    const data = await getDataProfileDMS(token, nip);
    res.json({
      message: "Berhasil get data profile DMS",
      data: data,
    });
  } catch (error) {
    handleError(res, error);
  }
};
