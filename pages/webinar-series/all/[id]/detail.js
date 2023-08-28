import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DetailWebinar from "@/components/WebinarSeries/DetailWebinar";
import { detailAllWebinar } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

function Detail() {
  const router = useRouter();
  const id = router?.query?.id;

  const { data, isLoading } = useQuery(
    ["webinar-series-all", id],
    () => detailAllWebinar(id),
    {}
  );

  const handleBack = () => router.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Webinar</title>
      </Head>
      <PageContainer
        loading={isLoading}
        onBack={handleBack}
        title="Detail Webinar Series"
        content="Webinar Series"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/webinar-series/all">
                  <a>Daftar Semua Webinar</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/webinar-series/my-webinar">
                  <a>Webinar Saya</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Webinar</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Card>
          <DetailWebinar data={data} />
        </Card>
      </PageContainer>
    </>
  );
}

Detail.getLayout = function getLayout(page) {
  return <Layout active="/webinar-series/all">{page}</Layout>;
};

Detail.Auth = {
  action: "manage",
  subject: "tickets",
};

export default Detail;
