import PageContainer from "@/components/PageContainer";
import { useRouter } from "next/router";

function WebinarUserDetailLayout({
  children,
  active = "all",
  loading,
  title,
  content,
}) {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PageContainer
      loading={loading}
      title={title}
      content={content}
      tabList={[
        {
          tab: "Detail Webinar",
          key: "detail",
          href: "/detail",
        },
        {
          tab: "Komentar",
          key: "comments",
          href: "/comments",
        },
      ]}
      tabActiveKey={active}
      tabProps={{
        type: "card",
        size: "small",
        onChange: (key) => {
          const path = `/webinar-series/my-webinar/${id}/${key}`;
          router.push(path);
        },
      }}
    >
      {children}
    </PageContainer>
  );
}

export default WebinarUserDetailLayout;
