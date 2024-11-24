import dynamic from "next/dynamic";

const Prompts = dynamic(
  () => import("@ant-design/x").then((mod) => mod.Prompts),
  {
    ssr: false,
  }
);

export default Prompts;
