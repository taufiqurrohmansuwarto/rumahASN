import dynamic from "next/dynamic";

const SenderHeader = dynamic(
  () => import("@ant-design/x").then((mod) => mod.Sender.Header),
  {
    ssr: false,
  }
);

export default SenderHeader;
