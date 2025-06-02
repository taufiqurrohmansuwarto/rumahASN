import dynamic from "next/dynamic";

const ProConfigProvider = dynamic(
  () =>
    import("@ant-design/pro-components").then((mod) => mod.ProConfigProvider),
  {
    ssr: false,
  }
);

export default ProConfigProvider;
