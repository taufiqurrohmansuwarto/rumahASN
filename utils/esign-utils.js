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

module.exports.sealPdf = async ({ totp, file }) => {
  const data = {
    idSubscriber,
    totp,
    signatureProperties: [
      {
        tampilan: "INVISIBLE",
        location: "null",
        contactInfo: "null",
        reason: "null",
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
