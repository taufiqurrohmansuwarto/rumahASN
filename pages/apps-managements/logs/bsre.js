import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { logBsre } from "@/services/log.services";
import { formatDateFull } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card, Space, Table, Tag } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

function LogBSRE() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 25,
  });

  const { data, isLoading, isFetching } = useQuery(
    ["log-bsre"],
    () => logBsre(query),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const columns = [
    {
      title: "Nama",
      key: "nama",
      render: (text) => (
        <Space direction="vertical">
          <span>{text?.user?.username}</span>
          <Tag>{text?.user?.group}</Tag>
        </Space>
      ),
    },
    {
      title: "Nama Webinar",
      key: "nama_webinar",
      render: (item) => (
        <span>{item?.webinar_series_participates?.webinar_series?.title}</span>
      ),
    },
    {
      title: "Log",
      key: "log",
      render: (item) => <pre>{JSON.stringify(item?.log, null, 2)}</pre>,
    },
    {
      title: "Waktu",
      key: "waktu",
      render: (item) => <span>{formatDateFull(item?.created_at)}</span>,
    },
  ];

  return (
    <>
      <Head>
        <title>Log BSRE</title>
      </Head>
      <PageContainer
        title="Log"
        subTitle="Layanan BsRE"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/webinar-series">
                  <a>Webinar Series</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Log</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Card title="Daftar Log BSRE">
          <Table
            size="small"
            loading={isLoading || isFetching}
            pagination={{
              current: query?.page,
              pageSize: query?.limit,
              total: data?.total,
              onChange: (page) => {
                setQuery((old) => ({ ...old, page }));
              },
            }}
            columns={columns}
            dataSource={data?.data}
          />
        </Card>
      </PageContainer>
    </>
  );
}

LogBSRE.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/logs">{page}</Layout>;
};

LogBSRE.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LogBSRE;
