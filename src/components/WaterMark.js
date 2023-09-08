const { default: dynamic } = require("next/dynamic");

const WaterMark = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod.WaterMark),
  {
    ssr: false,
  }
);

export default WaterMark;
