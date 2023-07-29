const { servicesData } = require("@/utils/data");
const { marked } = require("marked");

const getLayananKepegawaian = (req, res) => {
  try {
    const slug = req?.query;
    const result = servicesData.map(({ content, ...rest }) => rest);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const layananKepegawaianSlug = (req, res) => {
  try {
    const { slug } = req?.query;
    const result = servicesData.find((item) => item.slug === slug);

    const hasil = marked.parse(result?.content);

    res.json({
      ...result,
      content: hasil,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  getLayananKepegawaian,
  layananKepegawaianSlug,
};
