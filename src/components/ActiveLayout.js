import { DotChartOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import React from "react";
import PageContainer from "./PageContainer";

function ActiveLayout({
  children,
  active = "detail",
  role = "requester",
  id,
  loading = false,
}) {
  const customerTabs = [
    { key: "detail", tab: "Detail Ticket", icon: <DotChartOutlined /> },
    { key: "comments-customers-to-agents", tab: "Chats to Agent" },
  ];

  const agentTabs = [
    { key: "detail", tab: "Detail Ticket", icon: <DotChartOutlined /> },
    { key: "chats-customers", tab: "Chats to Customers" },
    { key: "chats-agents", tab: "Chats to Agent" },
  ];

  const router = useRouter();

  return (
    <PageContainer
      content="Detail Tiket"
      onBack={() => router.push("/tickets/semua")}
      loading={loading}
      tabList={role === "requester" ? customerTabs : agentTabs}
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
