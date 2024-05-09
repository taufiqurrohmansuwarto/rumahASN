// .babelrc.js
module.exports = {
  presets: [["next/babel"]],
  plugins: [
    ["import", { libraryName: "antd", style: true }],
    [
      "import",
      { libraryName: "@ant-design/plots", libraryDirectory: "es" },
      "@ant-design/plots",
    ],
  ],
};
