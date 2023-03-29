import dynamic from "next/dynamic";

const CheckCard = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod.CheckCard),
  {
    ssr: false,
  }
);

export default CheckCard;
