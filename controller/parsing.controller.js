const { parseMarkdown } = require("@/utils/parsing");

const markdownToHTML = async (req, res) => {
  try {
    const body = req.body;
    const html = parseMarkdown(body.text);
    console.log(html);
    res.status(200).json({ html });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  markdownToHTML,
};
