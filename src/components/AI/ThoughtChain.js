import dynamic from "next/dynamic";

const ThoughtChain = dynamic(
  () => import("@ant-design/x").then((mod) => mod.ThoughtChain),
  {
    ssr: false,
  }
);

export default ThoughtChain;
