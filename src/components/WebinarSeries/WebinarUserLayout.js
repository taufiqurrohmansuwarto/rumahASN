import PageContainer from "@/components/PageContainer";
import { useRouter } from "next/router";

function WebinarUserLayout({
  children,
  active = "all",
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
          tab: "Daftar Webinar",
          key: "all",
          href: "/webinar-series/all",
        },
        {
          tab: "Webinar Saya",
          key: "my-webinar",
          href: "/webinar-series/my-webinar",
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

export default WebinarUserLayout;
