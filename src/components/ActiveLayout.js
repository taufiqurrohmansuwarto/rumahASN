import { DotChartOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import React from "react";
import PageContainer from "./PageContainer";

function ActiveLayout({
  children,
  active = "detail",
  role,
  id,
  loading = false,
}) {
  const agenTabs = [
    { key: "detail", tab: "Detail Ticket", icon: <DotChartOutlined /> },
    { key: "comments-customers-to-agents", tab: "Chats to Agent" },
  ];

  const router = useRouter();

  return (
    <PageContainer
      content="Tiket"
      loading={loading}
      tabList={agenTabs}
      tabActiveKey={active}
      onTabChange={(e) => {
        let path = "";
        if (role === "requester") {
          path = `/tickets/${id}/${e}`;
        } else if (role === "agent") {
          path = `/agent/tickets/${id}/${e}`;
        } else if (role === "admin") {
          path = `/admin/tickets/${id}/${e}`;
        }
        router.push(path);
      }}
    >
      {children}
    </PageContainer>
  );
}

export default ActiveLayout;
