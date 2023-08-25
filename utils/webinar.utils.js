import { gotenberg, pipe } from "gotenberg-js-client";
import axios from "axios";

const toPdf = await pipe(
  gotenberg("http://localhost:3000"),
  gotenberg.convert.office("document.docx"),
  gotenberg.store()
);

module.exports.wordToPdf = async (req, url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const wordBuffer = Buffer.from(response.data, "binary");

  const client = gotenberg("http://localhost:3000");
};
module.exports.signCertificate = async () => {};
