import React from "react";
import PageContainer from "@/components/PageContainer";
import { useRouter } from "next/router";

function InformationLayout({
  children,
  active = "faq",
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
          tab: "Pertanyaan Umum",
          key: "faq",
          href: "/information/faq",
        },
        {
          tab: "Tutorial",
          key: "tutorials",
          href: "/information/tutorials",
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

export default InformationLayout;
