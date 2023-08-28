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

//
module.exports.wordToPdf = async (url, user) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "utf-8");
    const handler = new TemplateHandler();

    const data = {
      nama: user?.username,
      jabatan: user?.info?.jabatan?.jabatan,
      instansi: user?.info?.perangkat_daerah?.detail,
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
