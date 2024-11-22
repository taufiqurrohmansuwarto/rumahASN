import dynamic from "next/dynamic";

const Bubble = dynamic(
  () => import("@ant-design/x").then((mod) => mod.Bubble),
  {
    ssr: false,
  }
);

export default Bubble;
