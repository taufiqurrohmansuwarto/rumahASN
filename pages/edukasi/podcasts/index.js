import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Podcasts from "@/components/Podcasts";
import { podcastUsers } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, Col, List, Row } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

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
                  <List.Item key={item?.id} actions={[]}>
                    <List.Item.Meta
                      title={
                        <Link href={`/edukasi/podcasts/${item?.id}`}>
                          {item?.title}
                        </Link>
                      }
                      description={item?.short_description}
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