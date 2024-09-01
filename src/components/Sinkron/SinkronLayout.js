import { Tabs } from "antd";
import { useRouter } from "next/router";
import React from "react";

function SinkronLayout({ children, active }) {
  const router = useRouter();

  const routes = [
    {
      path: "/apps-managements/sync/data",
      key: "data",
      title: "Data Referensi",
    },
    {
      path: "/apps-managements/sync/pegawai-master",
      key: "pegawai-master",
      title: "Aplikasi SIMASTER",
    },
    {
      path: "/apps-managements/sync/pegawai-siasn",
      key: "pegawai-siasn",
      title: "Aplikasi SIASN",
    },
    {
      path: "/apps-managements/sync/bezzeting-jf",
      key: "bezzeting-jf",
      title: "Bezzeting JF",
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

export default SinkronLayout;
