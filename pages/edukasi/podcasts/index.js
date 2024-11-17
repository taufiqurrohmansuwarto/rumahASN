import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { podcastUsers } from "@/services/index";
import { formatDateLL } from "@/utils/client-utils";
import { ActionIcon, Group, Text } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card, Col, Grid, List, Row } from "antd";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

const MyPodcast = ({ item }) => {
  const router = useRouter();

  const gotoDetail = () => router.push(`/edukasi/podcasts/${item?.id}`);

  return (
    <div>
      <Group>
        {/* <Avatar radius="sm" size={80} src={item?.image_url} /> */}
        <Image
          width={80}
          height={80}
          src={item?.image_url}
          alt="podcast_cover"
        />
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
  const { data, isLoading } = useQuery(
    ["podcasts-users"],
    () => podcastUsers(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Edukasi - Podcast</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        loading={isLoading}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/">Forum Kepegawaian</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Podcast</Breadcrumb.Item>
          </Breadcrumb>
        )}
        title="Podcast"
        content="Daftar Layanan Podcast"
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
