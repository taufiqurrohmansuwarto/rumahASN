import dynamic from "next/dynamic";

const QueryFilter = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod.QueryFilter),
  {
    ssr: false,
  }
);

export default QueryFilter;
