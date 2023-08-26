import { gotenberg, pipe } from "gotenberg-js-client";
import axios from "axios";

const toPdf = await pipe(
  gotenberg("http://localhost:3000"),
  gotenberg.convert.office("document.docx"),
  gotenberg.store()
);

export const wordToPdf = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const wordBuffer = Buffer.from(response.data, "binary");

  return wordBuffer;
};
