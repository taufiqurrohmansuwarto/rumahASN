const { default: dynamic } = require("next/dynamic");

const Bar = dynamic(
  () => import("@ant-design/plots").then((item) => item?.Bar),
  {
    ssr: false,
  }
);

export default Bar;
