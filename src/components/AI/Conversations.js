import dynamic from "next/dynamic";

const Conversations = dynamic(
  () => import("@ant-design/x").then((mod) => mod.Conversations),
  {
    ssr: false,
  }
);

export default Conversations;
