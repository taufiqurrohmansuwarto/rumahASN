import axios from "axios";

module.exports.wordToPdf = async (req, url) => {
  const result = await axios.get(url, {
    responseType: "arraybuffer",
  });
};
module.exports.signCertificate = async () => {};
