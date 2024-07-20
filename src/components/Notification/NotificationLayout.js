import { Tabs } from "antd";
import { useRouter } from "next/router";
import React from "react";

function NotificationLayout({ children, active }) {
  const router = useRouter();

  const routes = [
    {
      path: "/notifications/forum-kepegawaian",
      key: "forum-kepegawaian",
      title: "Forum Kepegawaian",
    },
    {
      path: "/notifications/asn-connect",
      key: "asn-connect",
      title: "ASN Connect",
    },
    // {
    //   path: "/notifications/submission",
    //   key: "submission",
    //   title: "Usulan",
    // },
    {
      path: "/notifications/private-message",
      key: "private-message",
      title: "Pesan Pribadi",
    },
    {
      path: "/notifications/kepegawaian",
      key: "kepegawaian",
      title: "Kepegawaian",
    },
  ];

  const handleTabChange = (key) => {
    const route = routes.find((route) => route.key === key);
    router.push(route.path);
  };

  return (
    <Tabs
      tabBarStyle={{
        padding: 0,
        // margin: 0,
      }}
      type="card"
      activeKey={active}
      onChange={handleTabChange}
    >
      {routes.map((route) => (
        <Tabs.TabPane key={route.key} tab={route.title}>
          {children}
        </Tabs.TabPane>
      ))}
    </Tabs>
  );
}

export default NotificationLayout;
