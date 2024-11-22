import dynamic from "next/dynamic";

const Suggestion = dynamic(
  () => import("@ant-design/x").then((mod) => mod.Suggestion),
  {
    ssr: false,
  }
);

export default Suggestion;
