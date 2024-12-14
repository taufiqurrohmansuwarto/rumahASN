import dynamic from "next/dynamic";

const XStream = dynamic(
  () => import("@ant-design/x").then((mod) => mod?.XStream),
  {
    ssr: false,
  }
);

export default XStream;
