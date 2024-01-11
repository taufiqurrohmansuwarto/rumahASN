/**
 * bsre esign untuk melakukan tanda tangan digital melalui versi 2.0
 */
const idSubscriber = process.env.ESIGN_ID_SUBSCRIBER;

const esignFetcher = require("./esign-fetcher");

// sign

// seal
module.exports.getSealActivationOTP = async () => {
  return esignFetcher.post(`/api/v2/seal/get/activation`, {
    idSubscriber,
  });
};

module.exports.requestSealOtp = async ({ totp }) => {
  return esignFetcher.post(`/api/v2/seal/get/totp`, {
    idSubscriber,
    totp,
    data: 1,
  });
};

module.exports.sealPdf = async ({ totp, file, image }) => {
  // sertifikat webinar menggunakan kertas a4 dengan ukuran 210 x 297 mm ganti ke pixel
  const panjangKertas = 595;
  const lebarKertas = 842;

  const panjangQr = 50;
  const lebarQr = 50;

  const KURANG = 2;

  // letakkan qr code di pojok kanan bawah, originX dan originY ketika 0 berarti pojok kiri atas
  const originX = lebarKertas - lebarQr - KURANG;
  const originY = panjangKertas - panjangQr - KURANG;

  const data = {
    idSubscriber,
    totp,
    signatureProperties: [
      {
        imageBase64: image,
        tampilan: "VISIBLE",
        page: 1,
        originX,
        originY,
        width: 50.0,
        height: 50.0,
        location: "Surabaya",
        reason: "Sertifikat dibuat di aplikasi Rumah ASN BKD Jatim",
        contactInfo: "bkd@jatimprov.go.id",
      },
    ],
    file,
  };

  return esignFetcher.post(`/api/v2/seal/pdf`, data);
};

module.exports.checkStatusByEmail = async ({ email }) => {
  return esignFetcher.post(`/api/v2/user/check-status/`, {
    email,
  });
};

// verify
module.exports.verifyPdf = async ({ file }) => {
  return esignFetcher.post("/api/v2/verify/pdf", {
    file,
  });
};

module.exports.verifyPdfWithPassword = async ({ file, passsword }) => {
  return esignFetcher.post("/api/v2/verify/pdf", {
    file,
    passsword,
  });
};
