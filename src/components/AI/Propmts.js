import dynamic from "next/dynamic";

const Propmts = dynamic(
  () => import("@ant-design/x").then((mod) => mod.Propmts),
  {
    ssr: false,
  }
);

export default Propmts;
