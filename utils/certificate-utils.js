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

const { PDFDocument, TextAlignment, StandardFonts } = require("pdf-lib");

const qrCode = require("qrcode");

const { default: axios } = require("axios");

const { TemplateHandler, MimeType } = require("easy-template-x");
const { round } = require("lodash");
const { createQrFromId } = require("./bsre-fetcher");

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

const dynamicFontSize = (
  form,
  fieldName,
  fieldValue,
  font,
  fontSize,
  alignment
) => {
  const field = form.getTextField(fieldName);

  field.setText(fieldValue);

  if (alignment === "center") {
    field.setAlignment(TextAlignment.Center);
  } else if (alignment === "right") {
    field.setAlignment(TextAlignment.Right);
  } else {
    field.setAlignment(TextAlignment.Left);
  }

  field.enableMultiline();

  field.setFontSize(fontSize);

  field.enableReadOnly();

  field.updateAppearances(font);
  field.defaultUpdateAppearances(font);
};

const fieldsColumn = [
  "nama",
  "employee_number",
  "jabatan",
  "instansi",
  "nomer_sertifikat",
];

module.exports.viewCertificateWithUserInformation = async ({
  url,
  id,
  attributes,
}) => {
  try {
    const user = {
      nama: "IPUT TAUFIQURROHMAN SUWARTO",
      employee_number: "199103052019031008",
      jabatan: "Pranta Komputer Ahli Pertama",
      instansi: "BADAN KEPEGAWAIAN DAERAH PROVINSI JAWA TIMUR - BIDANG P3DASI",
      nomer_sertifikat: "123456",
    };
    const { nama, employee_number, jabatan, instansi, nomer_sertifikat } = user;
    const qrCode = await createQrFromId("abcedfghijklmnopqrstuvwxyz");
    const pdfBytes = await axios.get(url, { responseType: "arraybuffer" });
    const pdfDoc = await PDFDocument.load(pdfBytes.data);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

    // set all page to font
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      page.setFont(font);
    }

    const templateAttr = [
      {
        field: "nomer_sertifikat",
        fontSize: attributes?.nomerSertifikatFontSize || 10,
        alignment: attributes?.nomerSertifikatAlignment || "left",
      },
      {
        field: "nama",
        fontSize: attributes?.namaFontSize || 10,
        alignment: attributes?.namaAlignment || "left",
      },
      {
        field: "employee_number",
        fontSize: attributes?.employeeNumberFontSize || 10,
        alignment: attributes?.employeeNumberAlignment || "left",
      },
      {
        field: "jabatan",
        fontSize: attributes?.jabatanFontSize || 10,
        alignment: attributes?.jabatanAlignment || "left",
      },
      {
        field: "instansi",
        fontSize: attributes?.instansiFontSize || 10,
        alignment: attributes?.instansiAlignment || "left",
      },
    ];

    const certificateData = {
      nama: nama || "",
      employee_number: employee_number || "",
      jabatan: jabatan || "",
      instansi: instansi || "",
      nomer_sertifikat: nomer_sertifikat || "",
    };

    // add qr code in bottom right
    const qrImage = await pdfDoc.embedPng(qrCode);
    const qrDims = qrImage.scale(0.2);
    const page = pdfDoc.getPages()[0];
    page.drawImage(qrImage, {
      x: page.getWidth() - qrDims.width - 50,
      y: 50,
      width: qrDims.width,
      height: qrDims.height,
    });

    const form = pdfDoc.getForm();
    for (const field of fieldsColumn) {
      dynamicFontSize(
        form,
        field,
        certificateData[field],
        font,
        templateAttr.find((attr) => attr.field === field)?.fontSize,
        templateAttr.find((attr) => attr.field === field)?.alignment
      );
    }

    form.flatten();

    const pdfBytesWithText = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytesWithText).toString("base64");

    return {
      success: true,
      file: pdfBase64,
      id,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: error,
    };
  }
};

module.exports.generateCertificateWithUserInformation = async ({
  url,
  id,
  nomer_sertifikat,
  user,
  attributes,
}) => {
  try {
    const { nama, employee_number, jabatan, instansi } = user;
    const qrCode = await createQrFromId(id);
    const pdfBytes = await axios.get(url, { responseType: "arraybuffer" });
    const pdfDoc = await PDFDocument.load(pdfBytes.data);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

    const certificateData = {
      nama: nama || "",
      employee_number: employee_number || "",
      jabatan: jabatan || "",
      instansi: instansi || "",
      nomer_sertifikat: nomer_sertifikat || "",
    };

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      page.setFont(font);
    }

    const templateAttr = [
      {
        field: "nomer_sertifikat",
        fontSize: attributes?.nomerSertifikatFontSize || 10,
        alignment: attributes?.nomerSertifikatAlignment || "left",
      },
      {
        field: "nama",
        fontSize: attributes?.namaFontSize || 10,
        alignment: attributes?.namaAlignment || "left",
      },
      {
        field: "employee_number",
        fontSize: attributes?.employeeNumberFontSize || 10,
        alignment: attributes?.employeeNumberAlignment || "left",
      },
      {
        field: "jabatan",
        fontSize: attributes?.jabatanFontSize || 10,
        alignment: attributes?.jabatanAlignment || "left",
      },
      {
        field: "instansi",
        fontSize: attributes?.instansiFontSize || 10,
        alignment: attributes?.instansiAlignment || "left",
      },
    ];

    // add qr code in bottom right
    const qrImage = await pdfDoc.embedPng(qrCode);
    const qrDims = qrImage.scale(0.2);
    const page = pdfDoc.getPages()[0];
    page.drawImage(qrImage, {
      x: page.getWidth() - qrDims.width - 50,
      y: 50,
      width: qrDims.width,
      height: qrDims.height,
    });

    const form = pdfDoc.getForm();
    for (const field of fieldsColumn) {
      dynamicFontSize(
        form,
        field,
        certificateData[field],
        font,
        templateAttr.find((attr) => attr.field === field)?.fontSize,
        templateAttr.find((attr) => attr.field === field)?.alignment
      );
    }

    form.flatten();

    const pdfBytesWithText = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytesWithText).toString("base64");

    return {
      success: true,
      file: pdfBase64,
      id,
    };
  } catch (error) {
    console.log("error generate certificate", error);
    return {
      success: false,
      data: error,
    };
  }
};

module.exports.generateWebinarCertificate = async ({
  url,
  user,
  id,
  nomer_sertifikat,
}) => {
  try {
    const { nama, employee_number, jabatan, instansi } = user;
    const qrCode = await createQrFromId(id);
    const pdfBytes = await axios.get(url, { responseType: "arraybuffer" });
    const pdfDoc = await PDFDocument.load(pdfBytes.data);

    const certificateData = {
      nama: nama || "",
      employee_number: employee_number || "",
      jabatan: jabatan || "",
      instansi: instansi || "",
      nomer_sertifikat: nomer_sertifikat || "",
    };

    // add qr code in bottom right
    const qrImage = await pdfDoc.embedPng(qrCode);
    const qrDims = qrImage.scale(0.2);
    const page = pdfDoc.getPages()[0];
    page.drawImage(qrImage, {
      x: page.getWidth() - qrDims.width - 50,
      y: 50,
      width: qrDims.width,
      height: qrDims.height,
    });

    const form = pdfDoc.getForm();
    for (const field of fieldsColumn) {
      dynamicFontSize(form, field, certificateData[field]);
    }

    const pdfBytesWithText = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytesWithText).toString("base64");

    return {
      success: true,
      file: pdfBase64,
      id,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: error,
    };
  }
};
