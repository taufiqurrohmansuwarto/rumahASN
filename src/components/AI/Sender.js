import dynamic from "next/dynamic";

const Sender = dynamic(
  () => import("@ant-design/x").then((mod) => mod.Sender),
  {
    ssr: false,
  }
);

export default Sender;
