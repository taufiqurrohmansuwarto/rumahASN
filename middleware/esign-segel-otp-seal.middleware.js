const { requestSealOtp } = require("@/utils/esign-utils");
const DsSegelTOTP = require("@/models/ds-segel-totp.model");

module.exports = async (req, res, next) => {
  try {
    const result = await DsSegelTOTP.query()
      .where("type", "SEAL_ACTIVATION")
      .orderBy("created_at", "desc")
      .first();

    // check didatabase kalau tidak ada
    if (!result) {
      res
        .status(404)
        .json({ message: "Kode tidak ditemukan segera hubungi admin" });
    } else {
      const hasilSeal = await requestSealOtp({
        totp: result.totp,
      });

      // dan kalau totp nya null / kadaluarsa & lain sebagainya
      if (!hasilSeal?.data?.totp) {
        res
          .status(404)
          .json({ message: "Kode tidak ditemukan segera hubungi admin" });
      } else {
        // kalau ada, maka return totp nya
        req.totpSeal = hasilSeal?.data?.totp;
        next();
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
