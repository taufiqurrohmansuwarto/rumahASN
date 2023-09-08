import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import Watermark from "@/components/WaterMark";

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
      header={{
        breadcrumbRender: () => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">
                <a>Beranda</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/webinar-series/all">
                <a>Daftar Webinar</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/webinar-series/my-webinar">
                <a>Daftar Webinar Saya</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Detail Webinar</Breadcrumb.Item>
          </Breadcrumb>
        ),
      }}
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
      <Watermark content="Demo">{children}</Watermark>
    </PageContainer>
  );
}

export default WebinarUserDetailLayout;
