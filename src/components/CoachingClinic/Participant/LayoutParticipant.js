import PageContainer from "@/components/PageContainer";
import { useRouter } from "next/router";

import { Breadcrumb, Grid } from "antd";
import Link from "next/link";

function LayoutParticipant({
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
                <a>Forum Kepegawaian</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Coaching Clinic</Breadcrumb.Item>
          </Breadcrumb>
        ),
      }}
      tabList={[
        {
          tab: "Coaching Clinic",
          key: "all",
          href: "/coaching-clinic",
        },
        {
          tab: "Coaching Clinic Saya",
          key: "my-coaching-clinic",
          href: "/coaching-clinic/my-coaching-clinic",
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

export default LayoutParticipant;
