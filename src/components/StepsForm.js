import dynamic from "next/dynamic";

const StepsForm = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod.StepsForm),
  {
    ssr: false,
  }
);

export default StepsForm;
