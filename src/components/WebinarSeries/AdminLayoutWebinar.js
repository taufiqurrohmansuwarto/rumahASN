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
          tab: "Webinar Series",
          key: "webinar-series",
          href: "/apps-managements/webinar-series",
        },
        {
          tab: "Webinar Series Survey",
          key: "webinar-series-surveys",
          href: "/apps-managements/webinar-series-surveys",
        },
      ]}
      tabActiveKey={active}
      tabProps={{
        type: "card",
        size: "large",

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
