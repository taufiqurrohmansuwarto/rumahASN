const { default: dynamic } = require("next/dynamic");

const Column = dynamic(
  () => import("@ant-design/plots").then((item) => item?.Column),
  {
    ssr: false,
  }
);

export default Column;
