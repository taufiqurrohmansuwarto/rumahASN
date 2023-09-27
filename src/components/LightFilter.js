import dynamic from "next/dynamic";

const LightFilter = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod.LightFilter),
  {
    ssr: false,
  }
);

export default LightFilter;
