import { Tabs } from "antd";
import { useRouter } from "next/router";
import React from "react";
const BASE_URL = "/apps-managements/siasn-services/kenaikan-pangkat";

function KenaikanPangkatLayout({ children, active }) {
  const router = useRouter();

  const routes = [
    {
      path: `${BASE_URL}/sync`,
      key: "sync",
      title: "Sinkron SIASN",
    },
    {
      path: `${BASE_URL}/perangkat-daerah`,
      key: "perangkat-daerah",
      title: "Daftar Perangkat Daerah",
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

export default KenaikanPangkatLayout;
