import dynamic from "next/dynamic";

const Attachments = dynamic(
  () => import("@ant-design/x").then((mod) => mod.Attachments),
  {
    ssr: false,
  }
);

export default Attachments;
