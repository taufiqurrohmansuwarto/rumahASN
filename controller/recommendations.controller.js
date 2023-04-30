const { parseMarkdown } = require("@/utils/parsing");
const { recommendationsFaqs } = require("@/utils/query-utils");

const recommendationFaq = async (req, res) => {
  try {
    const { title } = req?.query;

    if (!title) {
      res.json(null);
    } else {
      const result = await recommendationsFaqs(title);
      const hasil = result?.rows?.map((item) => ({
        ...item,
        html: parseMarkdown(item?.answer),
      }));
      res.json(hasil);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  recommendationFaq,
};
