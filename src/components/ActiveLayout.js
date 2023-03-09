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
    { key: "detail", tab: "Detail Tiket", icon: <DotChartOutlined /> },
    { key: "chats-to-agents", tab: "Kirim Pesan ke Agent" },
  ];

  const agentTabs = [
    { key: "detail", tab: "Detil Tiket", icon: <DotChartOutlined /> },
    { key: "chats-customers", tab: "Chat ke penanya" },
    { key: "chats-agents", tab: "Chat ke Agent" },
  ];

  const adminTabs = [
    { key: "detail", tab: "Detil Tiket", icon: <DotChartOutlined /> },
    { key: "chats-customers", tab: "Chat Customer" },
    { key: "chats-agents", tab: "Chat Agent" },
  ];

  const router = useRouter();

  const tabList = (role) => {
    switch (role) {
      case "requester":
        return customerTabs;
      case "agent":
        return agentTabs;
      case "admin":
        return adminTabs;
      default:
        return customerTabs;
    }
  };

  return (
    <PageContainer
      onBack={() => {
        if (role === "requester") {
          router.push("/tickets/semua");
        } else if (role === "agent") {
          router.push("/agent/tickets/semua");
        } else if (role === "admin") {
          router.push("/admin/tickets-managements/semua");
        }
      }}
      loading={loading}
      tabList={tabList(role)}
      tabActiveKey={active}
      onTabChange={(e) => {
        let path = "";
        if (role === "requester") {
          path = `/tickets/${id}/${e}`;
        } else if (role === "agent") {
          path = `/agent/tickets/${id}/${e}`;
        } else if (role === "admin") {
          path = `/admin/tickets-managements/${id}/${e}`;
        }
        router.push(path);
      }}
    >
      {children}
    </PageContainer>
  );
}

export default ActiveLayout;
