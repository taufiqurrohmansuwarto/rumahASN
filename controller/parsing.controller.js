const { parseMarkdown } = require("@/utils/parsing");
const { marked } = require("marked");

const markdownToHTML = async (req, res) => {
  try {
    const body = req.body;
    // const html = parseMarkdown(body.text);
    const html = marked(body.text);
    res.status(200).json({ html });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  markdownToHTML,
};
