import dynamic from "next/dynamic";

const Line = dynamic(
  () => import("@ant-design/charts").then((mod) => mod.Line),
  {
    ssr: false,
  }
);

export default Line;
