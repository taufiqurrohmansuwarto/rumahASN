import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Carousel } from "@mantine/carousel";
import { Stack, Text } from "@mantine/core";
import {
  IconDatabase,
  IconDeviceComputerCamera,
  IconHistory,
  IconMapPin,
  IconMessage,
  IconUsers,
} from "@tabler/icons";
import { Affix, Card, Col, Flex, Row, Tabs } from "antd";
import { useRouter } from "next/router";
import Announcement from "../Announcement";
import SocmedCreatePost from "./SocmedCreatePost";
import SocmedMyPosts from "./SocmedMyPosts";
import SocmedPosts from "./SocmedPosts";
import UserPolls from "../Polls/UserPolls";
import ASNBirthdayList from "./AsnBirthdayList";

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
          <Row gutter={[8, 16]}>
            <Col md={24} xs={24}>
              <Stack spacing="sm">
                <Announcement />
                <Affix offsetTop={50}>
                  <Card>
                    <Carousel
                      slideSize="200"
                      height={42}
                      slideGap="sm"
                      align="start"
                      controlsOffset="md"
                      controlSize={23}
                      dragFree
                    >
                      <Carousel.Slide>
                        <Flex
                          align="center"
                          justify="center"
                          style={{
                            height: "100%",
                            borderRadius: 18,
                            border: "1px solid #d9d9d9",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            router.push("/pemutakhiran-data/komparasi")
                          }
                        >
                          <Flex align="center" gap={8}>
                            <IconDatabase color="blue" size={18} />
                            <Text size="sm" fw={700}>
                              Data MyASN
                            </Text>
                          </Flex>
                        </Flex>
                      </Carousel.Slide>
                      <Carousel.Slide>
                        <Flex
                          align="center"
                          justify="center"
                          style={{
                            cursor: "pointer",
                            height: "100%",
                            borderRadius: 18,
                            border: "1px solid #d9d9d9",
                          }}
                          onClick={() =>
                            router.push(
                              "/pemutakhiran-data/usulan-siasn/inbox-usulan"
                            )
                          }
                        >
                          <Flex align="center" gap={8}>
                            <IconHistory color="red" size={18} />
                            <Text size="sm" fw={700}>
                              Lacak Usulan SIASN
                            </Text>
                          </Flex>
                        </Flex>
                      </Carousel.Slide>
                      <Carousel.Slide>
                        <Flex
                          align="center"
                          justify="center"
                          style={{
                            height: "100%",
                            borderRadius: 18,
                            border: "1px solid #d9d9d9",
                            cursor: "pointer",
                          }}
                          onClick={() => router.push("/webinar-series/all")}
                        >
                          <Flex align="center" gap={8}>
                            <IconDeviceComputerCamera color="blue" size={18} />
                            <Text size="sm" fw={700}>
                              Webinar ASN
                            </Text>
                          </Flex>
                        </Flex>
                      </Carousel.Slide>
                      <Carousel.Slide>
                        <Flex
                          align="center"
                          justify="center"
                          style={{
                            height: "100%",
                            borderRadius: 18,
                            border: "1px solid #d9d9d9",
                            cursor: "pointer",
                          }}
                          onClick={() => router.push("/feeds")}
                        >
                          <Flex align="center" gap={8}>
                            <IconMessage color="orange" size={18} />
                            <Text size="sm" fw={700}>
                              Forum Kepegawaian
                            </Text>
                          </Flex>
                        </Flex>
                      </Carousel.Slide>
                      <Carousel.Slide>
                        <Flex
                          align="center"
                          justify="center"
                          style={{
                            height: "100%",
                            borderRadius: 18,
                            border: "1px solid #d9d9d9",
                            cursor: "pointer",
                          }}
                          onClick={() => router.push("/coaching-clinic/all")}
                        >
                          <Flex align="center" gap={8}>
                            <IconUsers color="green" size={18} />
                            <Text size="sm" fw={700}>
                              Coaching Clinic
                            </Text>
                          </Flex>
                        </Flex>
                      </Carousel.Slide>
                      <Carousel.Slide>
                        <Flex
                          align="center"
                          justify="center"
                          style={{
                            height: "100%",
                            borderRadius: 18,
                            border: "1px solid #d9d9d9",
                          }}
                        >
                          <Flex align="center" gap={8}>
                            <IconMapPin color="blue" size={18} />
                            <Text size="sm" fw={700}>
                              Kegiatan ASN
                            </Text>
                          </Flex>
                        </Flex>
                      </Carousel.Slide>
                    </Carousel>
                  </Card>
                </Affix>
                <Card>
                  <SocmedCreatePost />
                </Card>
                <Card>
                  <Tabs
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
                  />
                </Card>
              </Stack>
            </Col>
          </Row>
        </Col>
        <Col md={8} xs={24}>
          <Stack>
            <ASNBirthdayList />
            <UserPolls />
          </Stack>
        </Col>
      </Row>
    </>
  );
}

export default SocmedTabs;
