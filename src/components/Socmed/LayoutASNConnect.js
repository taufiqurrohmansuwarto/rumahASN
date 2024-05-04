import PageContainer from "@/components/PageContainer";
import { Grid, Layout } from "antd";
import { useRouter } from "next/router";

function LayoutASNConnect({ children, active = "asn-updates" }) {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const handleChangeTab = (key) => {
    router.push(`/asn-connect/${key}`);
  };

  return (
    <>
      <PageContainer
        header={{
          avatar: {
            src: "https://avatars.githubusercontent.com/u/8186664?v=4",
          },
        }}
        style={{
          backgroundColor: "white",
          padding: 0,
        }}
        tabActiveKey={active}
        onTabChange={handleChangeTab}
        tabList={[
          {
            key: "asn-updates",
            tab: "Beranda",
          },
          {
            key: "asn-discussions",
            tab: "Diskusi",
          },
          {
            key: "asn-communities",
            tab: "Komunitas",
          },
          {
            key: "asn-events",
            tab: "Kegiatan",
          },
        ]}
        tabPosition="top"
        tabProps={{
          tabBarStyle: {
            padding: 0,
            margin: 0,
            accentColor: "yellow",
            borderColor: "yellow",
            color: "yellow",
          },
          style: {
            color: "black",
          },
        }}
        token={{
          paddingBlockPageContainerContent: 0,
        }}
        title="Smart ASN Connect"
        content="Berjejaring, Berkolaborasi, Berinovasi Bersama ASN Connect."
      />
      <Layout.Content
        style={{
          paddingLeft: breakPoint.xs ? 0 : 24,
          paddingRight: breakPoint.xs ? 0 : 24,
          paddingTop: 16,
        }}
      >
        {children}
      </Layout.Content>
    </>
  );
}

export default LayoutASNConnect;
