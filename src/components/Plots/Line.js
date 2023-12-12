const { default: dynamic } = require("next/dynamic");

const Line = dynamic(
  () => import("@ant-design/plots").then((item) => item.Line),
  {
    ssr: false,
  }
);

export default Line;
