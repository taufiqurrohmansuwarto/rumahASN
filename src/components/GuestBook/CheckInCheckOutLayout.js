import { Tabs } from "antd";
import { useState } from "react";
import { useRouter } from "next/router";

function CheckInCheckOutLayout({ children, active }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(active);

  const handleChangeTab = (key) => {
    setActiveTab(key);
    router.push(`/guest-book-barcode/${key}`);
  };

  return (
    <Tabs type="card" activeKey={activeTab} onChange={handleChangeTab}>
      <Tabs.TabPane tab="Kedatangan" key="checkin">
        {children}
      </Tabs.TabPane>
      <Tabs.TabPane tab="Keluar" key="checkout">
        {children}
      </Tabs.TabPane>
    </Tabs>
  );
}

export default CheckInCheckOutLayout;
