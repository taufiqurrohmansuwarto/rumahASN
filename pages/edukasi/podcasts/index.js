import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Podcasts from "@/components/Podcasts";
import { podcastUsers } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, Col, List, Row } from "antd";
import Head from "next/head";
import Link from "next/link";
import React from "react";

function Podcast() {
  const { data, isLoading } = useQuery(
    ["podcasts-users"],
    () => podcastUsers(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - Edukasi - Podcast</title>
      </Head>
      <PageContainer
        loading={isLoading}
        title="Podcast"
        subTitle="Edukasi Podcast"
      >
        <Row>
          <Col md={18} xs={24}>
            <Card>
              <List
                dataSource={data?.results}
                rowKey={(row) => row?.id}
                renderItem={(item) => (
                  <List.Item
                    key={item?.id}
                    actions={[]}
                    extra={<Podcasts url={item?.audio_url} />}
                  >
                    <List.Item.Meta
                      title={
                        <Link href={`/edukasi/podcasts/${item?.id}`}>
                          {item?.title}
                        </Link>
                      }
                      description={item?.description}
                      avatar={<Avatar src={item?.image_url} />}
                    />
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
