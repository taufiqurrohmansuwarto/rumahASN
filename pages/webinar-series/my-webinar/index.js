import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { webinarUser } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card, Space, Table } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

function MyWebinar() {
  const router = useRouter();

  const [query, setQuery] = useState({
    page: 1,
    limit: 25,
  });

  const { data, isLoading } = useQuery(
    ["webinar-user", query],
    () => webinarUser(query),
    {}
  );

  const handleBack = () => router.back();

  const gotoDetail = (id) =>
    router.push(`/webinar-series/my-webinar/${id}/detail`);

  const columns = [
    {
      title: "Nomer Series",
      key: "episode",
      render: (text) => text?.webinar_series?.episode,
    },
    {
      title: "Judul",
      key: "judul",
      render: (text) => text?.webinar_series?.title,
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (text) => {
        return (
          <Space>
            <a onClick={() => gotoDetail(text?.webinar_series_id)}>Detail</a>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Head>
        <title>Rumah ASN - Webinar Saya</title>
      </Head>
      <PageContainer
        loading={isLoading}
        title="Daftar Webinar Saya"
        subTitle="Webinar Series"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Webinar Series Saya</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Card>
          <Table
            pagination={{
              pageSize: query?.limit,
              total: data?.total,
              onChange: (page, limit) => {
                setQuery({
                  ...query,
                  page,
                });
              },
              current: query?.page,
            }}
            columns={columns}
            dataSource={data?.data}
            rowKey={(row) => `${row?.webinar_id}${row?.user_id}`}
          />
        </Card>

        {/* {JSON.stringify(data)} */}
      </PageContainer>
    </>
  );
}

MyWebinar.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

MyWebinar.Auth = {
  action: "manage",
  subject: "tickets",
};

export default MyWebinar;
