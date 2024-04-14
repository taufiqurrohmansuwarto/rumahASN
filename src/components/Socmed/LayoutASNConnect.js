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
        style={{
          backgroundColor: "white",
        }}
        ghost
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
            key: "asn-storylines",
            tab: "Storylines",
          },
          {
            key: "asn-events",
            tab: "Kegiatan",
          },
          {
            key: "asn-calendar",
            tab: "Kalender",
          },
        ]}
        tabPosition="top"
        tabProps={{
          style: {
            color: "black",
          },
          // centered: true,
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
