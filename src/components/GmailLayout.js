import { Breadcrumb, Card, Grid, Tabs } from "antd";
import { useRouter } from "next/router";
import PageContainer from "@/components/PageContainer";
import Link from "next/link";

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
