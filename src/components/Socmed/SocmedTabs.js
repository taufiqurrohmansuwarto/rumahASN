import { Card, Col, Row, Tabs } from "antd";
import { useRouter } from "next/router";
import React from "react";
import SocmedPosts from "./SocmedPosts";
import SocmedCreatePost from "./SocmedCreatePost";
import SocmedMyPosts from "./SocmedMyPosts";
import SocmedActivities from "./SocmedActivities";

function SocmedTabs() {
  const router = useRouter();

  const handleChangeTab = (key) => {
    if (key === "all") {
      router.push(`/asn-connect/asn-updates`);
    } else {
      router.push(`/asn-connect/asn-updates/my-posts`);
    }
  };

  const activeKey = router.pathname.includes("my-posts") ? "my" : "all";

  return (
    <>
      <Row gutter={[8, 8]}>
        <Col md={16}>
          <Row gutter={[8, 8]}>
            <Col md={24}>
              <Card>
                <SocmedCreatePost />
              </Card>
            </Col>
            <Col md={24}>
              <Card title="Daftar Postingan">
                <Tabs
                  defaultActiveKey="all"
                  type="card"
                  activeKey={activeKey}
                  onChange={handleChangeTab}
                  items={[
                    {
                      key: "all",
                      label: "Semua Postingan",
                      tab: "Semua Postingan",
                      children: <SocmedPosts />,
                    },
                    {
                      key: "my",
                      label: "Postingan Saya",
                      tab: "Postingan Saya",
                      children: <SocmedMyPosts />,
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </Col>
        <Col md={8}>
          <Card title="Aktifitas">
            <SocmedActivities />
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default SocmedTabs;