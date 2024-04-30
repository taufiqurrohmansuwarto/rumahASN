import dynamic from "next/dynamic";

const Line = dynamic(
  () => import("@ant-design/plots").then((mod) => mod.Line),
  {
    ssr: false,
  }
);

export default Line;
