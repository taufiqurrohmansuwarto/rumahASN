const { PDFDocument } = require("pdf-lib");

module.exports.fillDocument = async ({ url, data }) => {
  const pdfDoc = await PDFDocument.load(url);
  const form = pdfDoc.getForm();

  const fields = form.getFields();
  for (const [key, value] of Object.entries(data)) {
    fields[key].setText(value);
  }

  //   change to buffer and return to base64
  const pdfBytes = await pdfDoc.save();
  const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

  return pdfBase64;
};
