import PageContainer from "@/components/PageContainer";
import { useRouter } from "next/router";

import { Breadcrumb, Grid } from "antd";
import Link from "next/link";

function WebinarUserLayout({
  children,
  active = "all",
  loading,
  title,
  content,
}) {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  return (
    <PageContainer
      loading={loading}
      title={title}
      content={content}
      childrenContentStyle={{
        padding: breakPoint.xs ? 0 : null,
      }}
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
        // active color to red
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
