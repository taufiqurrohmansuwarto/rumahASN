import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Stack } from "@mantine/core";
import { Affix, Card, Col, Row } from "antd";
import { useRouter } from "next/router";
import Announcement from "../Announcement";
import UserPolls from "../Polls/UserPolls";
import QuickAccessCarousel from "./QuickAccessCarousel";
import SocmedCreatePost from "./SocmedCreatePost";
import SocmedPosts from "./SocmedPosts";

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
            <Col md={24} xs={24}>
              <Stack spacing="xs">
                <Announcement />
                <Affix offsetTop={50}>
                  <QuickAccessCarousel />
                </Affix>
                <Card>
                  <SocmedCreatePost />
                </Card>
                <SocmedPosts />
                {/* <Tabs
                  defaultActiveKey="all"
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
                /> */}
              </Stack>
            </Col>
          </Row>
        </Col>
        <Col md={8} xs={24}>
          <Row gutter={[16, 16]}>
            <Col md={24} xs={24}>
              <UserPolls />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}

export default SocmedTabs;
