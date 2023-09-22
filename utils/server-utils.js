// markdown to text using marked
module.exports.markdownToText = (markdown) => {
  const marked = require("marked");
  const html = marked(markdown);
  const text = html.replace(/<[^>]*>/g, "");
  return text;
};
