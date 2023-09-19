import PageContainer from "@/components/PageContainer";
import { useRouter } from "next/router";

import Watermark from "@/components/WaterMark";
import { Breadcrumb } from "antd";
import Link from "next/link";

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
      header={{
        breadcrumbRender: () => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">
                <a>Beranda</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Webinar</Breadcrumb.Item>
          </Breadcrumb>
        ),
      }}
      tabList={[
        {
          tab: "Daftar Semua Webinar",
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
      <Watermark content="Demo" fontSize={40}>
        {children}
      </Watermark>
    </PageContainer>
  );
}

export default WebinarUserLayout;
