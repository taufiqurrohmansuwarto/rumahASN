import React from "react";
import PageContainer from "@/components/PageContainer";
import { useRouter } from "next/router";
import { Grid } from "antd";

function InformationLayout({
  children,
  active = "faq",
  loading,
  title,
  content,
}) {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  return (
    <PageContainer
      childrenContentStyle={{
        padding: breakPoint.xs ? 0 : null,
      }}
      loading={loading}
      title={title}
      content={content}
      tabList={[
        {
          tab: "Pertanyaan Umum",
          key: "faq",
          href: "/information/faq",
        },
        {
          tab: "Layanan",
          key: "layanan",
          href: "/information/layanan",
        },
        {
          tab: "Tutorial",
          key: "tutorials",
          href: "/information/tutorials",
        },
      ]}
      tabActiveKey={active}
      tabProps={{
        size: "small",
        color: "primary",
        onChange: (key) => {
          router.push(key);
        },
      }}
    >
      {children}
    </PageContainer>
  );
}

export default InformationLayout;
