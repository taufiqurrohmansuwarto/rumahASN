const {
  adjust,
  convert,
  gotenberg,
  office,
  pipe,
  please,
  to,
  a4,
  landscape,
} = require("gotenberg-js-client");

const { PDFDocument, TextAlignment } = require("pdf-lib");

const qrCode = require("qrcode");

const { default: axios } = require("axios");

const { TemplateHandler, MimeType } = require("easy-template-x");
const { round } = require("lodash");

const GOTENBERG_URL = process.env.GOTENBERG_URL;

const toPDF = pipe(
  gotenberg(""),
  convert,
  office,
  adjust({
    url: GOTENBERG_URL,
  }),
  to(a4, landscape),
  please
);

const getParticipantName = (user) => {
  if (user?.group === "GOOGLE") {
    const nama_lengkap = `${user?.info?.gelar_depan} ${user?.info?.username} ${user?.info?.gelar_belakang}`;
    return nama_lengkap;
  } else {
    return user?.username;
  }
};

const getParticipantEmployeeNumber = (user) => {
  if (user?.group === "GOOGLE") {
    return user?.info?.employee_number;
  } else {
    return user?.employee_number;
  }
};

const pdfToBuffer = (pdf) => {
  return new Promise((resolve, reject) => {
    const pdfBuffer = [];
    pdf.on("data", (chunk) => pdfBuffer.push(chunk));

    pdf.on("end", () => {
      const pdfData = Buffer.concat(pdfBuffer);
      resolve(pdfData);
    });

    pdf.on("error", (error) => {
      reject(error);
    });
  });
};

const dynamicFontSize = (form, fieldName, fieldValue) => {
  const field = form.getTextField(fieldName);

  field.setText(fieldValue);
  field.setAlignment(TextAlignment.Center);
  field.enableMultiline();
  field.setFontSize(10);
  field.enableReadOnly();
};

module.exports.generateWebinarCertificate = async ({
  url,
  user,
  certificateNumber,
}) => {
  try {
    const pdfBytes = await axios.get(url, { responseType: "arraybuffer" });
    const pdfDoc = await PDFDocument.load(pdfBytes.data);

    // get height and width not minus
    const { width, height } = pdfDoc.getPages()[0].getSize();

    const form = pdfDoc.getForm();

    const nama = getParticipantName(user) || "";
    const employee_number = getParticipantEmployeeNumber(user) || "";
    const jabatan = user?.info?.jabatan?.jabatan || "";
    const instansi = user?.info?.perangkat_daerah?.detail || "";
    const nomer_sertifikat = certificateNumber || "";

    const certificateData = {
      nama,
      employee_number,
      jabatan,
      instansi,
      nomer_sertifikat,
    };

    // iterate form
    const fields = form.getFields();

    for (const field of fields) {
      const fieldName = field.getName();

      dynamicFontSize(form, fieldName, certificateData[fieldName]);
    }

    const pdfBytesWithText = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytesWithText).toString("base64");
    const data = {
      file: pdfBase64,
      // normalize minus value and 1 decimal using lodash
      width: round(width, 0),
      height: round(height, 0),
    };

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: error,
    };
  }
};
