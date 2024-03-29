import { Stack } from "@mantine/core";
import { Card, Col, Row, Tabs } from "antd";
import { useRouter } from "next/router";
import Announcement from "../Announcement";
import SocmedCreatePost from "./SocmedCreatePost";
import SocmedMyPosts from "./SocmedMyPosts";
import SocmedPosts from "./SocmedPosts";
import useScrollRestoration from "@/hooks/useScrollRestoration";

function SocmedTabs() {
  useScrollRestoration();
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
        <Col md={16} xs={24}>
          <Row gutter={[8, 8]}>
            <Col md={24}>
              <Card>
                <Stack>
                  <Announcement />
                  <SocmedCreatePost />
                </Stack>
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
        {/* <Col md={8} xs={24}>
          <Card title="Aktifitas">
            <SocmedActivities />
          </Card>
        </Col> */}
      </Row>
    </>
  );
}

export default SocmedTabs;
