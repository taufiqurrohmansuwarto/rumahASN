import dynamic from "next/dynamic";

const Attachment = dynamic(
  () => import("@ant-design/x").then((mod) => mod.Attachment),
  {
    ssr: false,
  }
);

export default Attachment;
