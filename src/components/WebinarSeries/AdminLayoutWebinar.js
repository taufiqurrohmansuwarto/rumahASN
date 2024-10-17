import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import { useRouter } from "next/router";

function AdminLayoutWebinar({
  children,
  active = "webinar-series",
  loading,
  title,
  content,
}) {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  return (
    <PageContainer
      loading={loading}
      childrenContentStyle={{
        padding: breakPoint.xs ? 0 : null,
      }}
      title={title}
      content={content}
      tabList={[
        {
          tab: "Series",
          key: "webinar-series",
          href: "/apps-managements/webinar-series",
        },
        {
          tab: "Kuisioner",
          key: "webinar-series-surveys",
          href: "/apps-managements/webinar-series-surveys",
        },
      ]}
      tabActiveKey={active}
      tabProps={{
        type: "card",
        size: "small",
        onChange: (key) => {
          router.push(key);
        },
      }}
    >
      {children}
    </PageContainer>
  );
}

export default AdminLayoutWebinar;
