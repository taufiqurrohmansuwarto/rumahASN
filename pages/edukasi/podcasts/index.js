import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { podcastUsers } from "@/services/index";
import { formatDateLL } from "@/utils/client-utils";
import { ActionIcon, Group, Text, Button } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, Col, List, Row } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const MyPodcast = ({ item }) => {
  const router = useRouter();

  const gotoDetail = () => router.push(`/edukasi/podcasts/${item?.id}`);

  return (
    <div>
      <Group>
        <Avatar size={80} src={item?.image_url} />
        <div
          style={{
            width: "60%",
          }}
        >
          <Text
            onClick={gotoDetail}
            size="sm"
            sx={{
              fontWeight: 700,
              ":hover": {
                cursor: "pointer",
              },
            }}
          >
            {item?.title}
          </Text>
          <Text lineClamp={2} mb="sm" color="dimmed" size="sm">
            {item?.short_description}
          </Text>
          <Group>
            <ActionIcon
              onClick={gotoDetail}
              color="green"
              size="lg"
              radius="xl"
              variant="filled"
            >
              <IconPlayerPlay size={14} />
            </ActionIcon>
            <div>
              <Text>{formatDateLL(item?.created_at)}</Text>
            </div>
          </Group>
        </div>
      </Group>
    </div>
  );
};

function Podcast() {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["podcasts-users"],
    () => podcastUsers(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleBack = () => router.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Edukasi - Podcast</title>
      </Head>
      <PageContainer
        loading={isLoading}
        title="Podcast"
        subTitle="Daftar Edukasi Podcast Rumah ASN"
        onBack={handleBack}
      >
        <Row>
          <Col md={18} xs={24}>
            <Card>
              <List
                dataSource={data?.results}
                rowKey={(row) => row?.id}
                renderItem={(item) => (
                  <List.Item>
                    <MyPodcast item={item} />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
}

Podcast.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

Podcast.Auth = {
  action: "manage",
  subject: "tickets",
};

export default Podcast;
