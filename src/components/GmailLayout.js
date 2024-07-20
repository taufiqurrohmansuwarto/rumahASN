import dynamic from "next/dynamic";

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function GmailLayout({ children, active = "inbox" }) {
  return <ProLayout>{children}</ProLayout>;
}

export default GmailLayout;
