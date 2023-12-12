const { default: dynamic } = require("next/dynamic");

const Pie = dynamic(
  () => import("@ant-design/plots").then((item) => item.Pie),
  {
    ssr: false,
  }
);

export default Pie;
