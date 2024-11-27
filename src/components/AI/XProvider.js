import dynamic from "next/dynamic";

const XProvider = dynamic(
  () => import("@ant-design/x").then((mod) => mod?.XProvider),
  {
    ssr: false,
  }
);

export default XProvider;
