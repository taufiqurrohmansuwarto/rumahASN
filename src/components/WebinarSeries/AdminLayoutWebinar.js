import PageContainer from "@/components/PageContainer";
import { useRouter } from "next/router";

function AdminLayoutWebinar({
  children,
  active = "webinar-series",
  loading,
  title,
  content,
}) {
  const router = useRouter();

  return (
    <PageContainer
      loading={loading}
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
