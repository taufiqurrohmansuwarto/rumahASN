import { Breadcrumb, Card, Grid, Tabs } from "antd";
import { useRouter } from "next/router";
import PageContainer from "@/components/PageContainer";
import Link from "next/link";

function MailLayout({ children, active = "inbox" }) {
  const router = useRouter();
  const screens = Grid.useBreakpoint();

  const tabs = [
    {
      label: "Kotak Masuk",
      key: "inbox",
    },
    {
      label: "Pesan Terkirim",
      key: "sent",
    },
  ];

  const changePage = (key) => {
    router.push(`/mails/${key}`);
  };

  return (
    <PageContainer
      breadcrumbRender={() => (
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/feeds">Beranda</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Pesan Pribadi</Breadcrumb.Item>
        </Breadcrumb>
      )}
    >
      <Card>
        <Tabs
          onTabClick={changePage}
          tabPosition={
            screens.xxl || screens.xl || screens.lg || screens.md
              ? "left"
              : "top"
          }
          activeKey={active}
        >
          {tabs.map((tab) => (
            <Tabs.TabPane key={tab.key} tab={tab.label}>
              {children}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Card>
    </PageContainer>
  );
}

export default MailLayout;
