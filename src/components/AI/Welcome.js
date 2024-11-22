import dynamic from "next/dynamic";

const Welcome = dynamic(
  () => import("@ant-design/x").then((mod) => mod.Welcome),
  {
    ssr: false,
  }
);

export default Welcome;
