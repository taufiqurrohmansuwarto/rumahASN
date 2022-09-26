import dynamic from "next/dynamic";

const PageContainer = dynamic(
  () => import("@ant-design/pro-layout").then((mod) => mod.PageContainer),
  {
    ssr: false,
  }
);

export default PageContainer;
