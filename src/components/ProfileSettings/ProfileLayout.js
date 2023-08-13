import PageContainer from "@/components/PageContainer";
import { Breadcrumb, Card, Grid, Tabs } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

function ProfileLayout({ children, tabActiveKey = "profil" }) {
  const router = useRouter();

  const screens = Grid.useBreakpoint();

  const items = [
    {
      label: "Profil",
      key: "profil",
    },
    {
      label: "Aktivitas",
      key: "activities",
    },
    {
      label: "Pertanyaan Tersimpan",
      key: "saved",
    },
    {
      label: "Template Balasan",
      key: "saved-replies",
    },
  ];

  const handleTabChange = (key) => {
    if (key === "profil") {
      router.push(`/settings/profile`);
    } else {
      router.push(`/settings/profile/${key}`);
    }
  };

  return (
    <PageContainer
      breadcrumbRender={() => (
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/feeds">
              <a>Beranda</a>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Profil</Breadcrumb.Item>
        </Breadcrumb>
      )}
    >
      <Card>
        <Tabs
          tabPosition={
            screens.xxl || screens.xl || screens.lg || screens.md
              ? "left"
              : "top"
          }
          activeKey={tabActiveKey}
          // type="card"
          onTabClick={handleTabChange}
        >
          {items.map((item) => (
            <Tabs.TabPane key={item.key} tab={item.label}>
              {children}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Card>
    </PageContainer>
  );
}

export default ProfileLayout;
