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

const { default: axios } = require("axios");

const { TemplateHandler, MimeType } = require("easy-template-x");

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

//
module.exports.wordToPdf = async (url, user, nomerSertifikat) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "utf-8");
    const handler = new TemplateHandler();

    const data = {
      nama: getParticipantName(user),
      employee_number: getParticipantEmployeeNumber(user),
      jabatan: user?.info?.jabatan?.jabatan,
      instansi: user?.info?.perangkat_daerah?.detail,
      nomer_sertifikat: nomerSertifikat,
    };

    const doc = await handler.process(buffer, data, MimeType.docx);

    const pdf = await toPDF({
      "document.docx": doc,
    });

    return pdf;
  } catch (error) {
    console.log(error);
  }
};
