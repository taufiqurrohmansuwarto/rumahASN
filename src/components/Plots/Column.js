import dynamic from "next/dynamic";

const Column = dynamic(
  () => import("@ant-design/plots").then((mod) => mod.Column),
  {
    ssr: false,
  }
);

export default Column;
