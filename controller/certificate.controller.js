const WebinarSeriesParticipates = require("@/models/webinar-series-participates.model");
const { default: axios } = require("axios");

const URL_FILE = "https://siasn.bkd.jatimprov.go.id:9000/public";

const downloadWebinarCertificates = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await WebinarSeriesParticipates.query()
      .findById(id)
      .select("document_sign")
      .select("id");

    if (!result) {
      res.json(null);
    } else {
      res.json(result?.document_sign);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkWebinarCertificates = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await WebinarSeriesParticipates.query()
      .findById(id)
      .withGraphFetched("[webinar_series]");

    if (!result) {
      res.json(null);
    } else {
      if (
        result?.is_generate_certificate &&
        result?.user_information &&
        result?.document_sign_at
      ) {
        if (result?.document_sign_url) {
          const response = await axios.get(
            `${URL_FILE}/${result?.document_sign_url}`,
            {
              responseType: "arraybuffer",
            }
          );

          const buffer = Buffer.from(response?.data, "binary").toString(
            "base64"
          );
          res.json({ ...result, document_sign: buffer });
        } else if (result?.document_sign) {
          res.json(result);
        }

        res.json(result);
      } else {
        res.json(null);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  checkWebinarCertificates,
  downloadWebinarCertificates,
};
