/**
 * bsre esign untuk melakukan tanda tangan digital melalui versi 2.0
 */
const idSubscriber = process.env.ESIGN_ID_SUBSCRIBER;
const esignFetcher = require("./esign-fetcher");
require("dotenv").config();

// sign
module.exports.signWithNikAndPassphrase = async ({ nik, passphrase, file }) => {
  const data = {
    nik,
    passphrase,
    signatureProperties: file?.map(() => {
      return {
        tampilan: "INVISIBLE",
      };
    }),
    file,
  };

  return new Promise((resolve, reject) => {
    esignFetcher
      .post(`/api/v2/sign/pdf`, data)
      .then((response) => {
        resolve({
          success: true,
          data: response?.data,
        });
      })
      .catch((error) => {
        resolve({
          success: false,
          data: error,
        });
      });
  });
};

// seal
module.exports.getSealActivationOTP = async (idSubscriber) => {
  return new Promise((resolve, reject) => {
    esignFetcher
      .post(`/api/v2/seal/get/activation`, {
        idSubscriber,
      })
      .then((response) => {
        resolve({
          success: true,
          data: response?.data,
        });
      })
      .catch((error) => {
        resolve({
          success: false,
          data: error,
        });
      });
  });
};

module.exports.refreshSealActivationTotp = async ({ idSubscriber, totp }) => {
  return new Promise((resolve, reject) => {
    esignFetcher
      .post(`/api/v2/seal/get/activation`, {
        idSubscriber,
        totp,
      })
      .then((response) => {
        resolve({
          success: true,
          data: response?.data?.data,
        });
      })
      .catch((error) => {
        resolve({
          success: false,
          data: error,
        });
      });
  });
};

module.exports.requestSealOtp = async ({ totp }) => {
  const data = {
    idSubscriber,
    totp,
    data: 1,
  };

  return new Promise((resolve, reject) => {
    esignFetcher
      .post(`/api/v2/seal/get/totp`, data)
      .then((response) => {
        if (!response?.data?.result) {
          resolve({
            success: false,
            data: response?.data,
          });
        } else {
          resolve({
            success: true,
            data: response?.data,
          });
        }
      })
      .catch((error) => {
        resolve({
          success: false,
          data: error,
        });
      });
  });
};

module.exports.requestSealOtpWithIdSubscriber = async ({
  totp,
  idSubscriber,
}) => {
  const data = {
    idSubscriber,
    totp,
    data: 1,
  };

  return new Promise((resolve, reject) => {
    esignFetcher
      .post(`/api/v2/seal/get/totp`, data)
      .then((response) => {
        if (!response?.data?.result) {
          resolve({
            success: false,
            data: response?.data,
          });
        } else {
          resolve({
            success: true,
            data: response?.data,
          });
        }
      })
      .catch((error) => {
        resolve({
          success: false,
          data: error,
        });
      });
  });
};

module.exports.sealPdf = async ({ totp, file, idSubscriber }) => {
  const data = {
    idSubscriber,
    totp,
    signatureProperties: [
      {
        tampilan: "INVISIBLE",
        location: "Surabaya",
        reason: "Aplikasi Rumah ASN BKD Provinsi Jawa Timur",
        contactInfo: "bkd@jatimprov.go.id",
      },
    ],
    file: [file],
  };

  return new Promise((resolve, reject) => {
    esignFetcher
      .post(`/api/v2/seal/pdf`, data)
      .then((response) => {
        resolve({
          success: true,
          data: response?.data,
        });
      })
      .catch((error) => {
        resolve({
          success: false,
          data: error,
        });
      });
  });
};

module.exports.checkStatusByEmail = async ({ email }) => {
  return esignFetcher.post(`/api/v2/user/check-status/`, {
    email,
  });
};

// verify
module.exports.verifyPdf = async ({ file }) => {
  return new Promise((resolve, reject) => {
    esignFetcher
      .post(`/api/v2/verify/pdf`, {
        file,
      })
      .then((response) => {
        resolve({
          success: true,
          data: response?.data,
        });
      })
      .catch((error) => {
        resolve({
          success: false,
          data: error,
        });
      });
  });
};

module.exports.verifyPdfWithPassword = async ({ file, passsword }) => {
  return esignFetcher.post("/api/v2/verify/pdf", {
    file,
    passsword,
  });
};

// verify with nik
module.exports.verifyUserWithNik = async ({ nik }) => {
  return new Promise((resolve, reject) => {
    esignFetcher
      .post(`/api/v2/user/check/status`, {
        nik,
      })
      .then((response) => {
        resolve({
          success: true,
          data: response?.data,
        });
      })
      .catch((error) => {
        resolve({
          success: false,
          data: error,
        });
      });
  });
};

export const signWithCoordinate = async ({
  nik,
  passphrase,
  file,
  signatureProperties,
}) => {
  const data = {
    nik,
    passphrase,
    signatureProperties,
    file,
  };

  // Log request to BSrE (redact sensitive data)
  console.log("[signWithCoordinate] Sending request to BSrE:");
  console.log(
    "  signatureProperties:",
    JSON.stringify(
      signatureProperties.map((sp) => ({
        ...sp,
        imageBase64: sp.imageBase64
          ? `[REDACTED_${sp.imageBase64.length}_bytes]`
          : undefined,
      })),
      null,
      2
    )
  );

  return new Promise((resolve, reject) => {
    esignFetcher
      .post("/api/v2/sign/pdf", data)
      .then((response) => {
        resolve({
          success: true,
          data: response?.data,
        });
      })
      .catch((error) => {
        resolve({
          success: false,
          data: {
            message: error?.error,
            status: error?.status_code,
          },
        });
      });
  });
};
