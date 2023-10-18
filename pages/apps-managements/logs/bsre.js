import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { logBsre } from "@/services/log.services";
import { formatDateFull } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card, Modal, Space, Table, Tag } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { Code } from "@mantine/core";

function LogBSRE() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isFetching } = useQuery(
    ["log-bsre", query],
    () => logBsre(query),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const showModal = (item) => {
    Modal.info({
      title: "Detail Log Unduh Sertifikat",
      centered: true,
      width: 800,
      content: (
        <div
          style={{
            maxHeight: 400,
            minWidth: 600,
            overflow: "auto",
          }}
        >
          <Code>{JSON.stringify(item?.log, null, 2)}</Code>,
        </div>
      ),
    });
  };

  const columns = [
    {
      title: "Nama / Cara Masuk",
      key: "nama",
      render: (text) => (
        <Space>
          <span>{text?.user?.username}</span>
          <Tag color="yellow">{text?.user?.group}</Tag>
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
      title: "Status",
      key: "status",
      render: (item) => {
        return (
          <>
            <Tag
              style={{
                cursor: "pointer",
              }}
              onClick={() => showModal(item)}
              color={item?.status === "success" ? "green" : "red"}
            >
              {item?.status}
            </Tag>
          </>
        );
      },
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
        <title>Log Unduh Sertifikat TTE</title>
      </Head>
      <PageContainer
        title="Log BSrE"
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
        <Card title="Daftar Log Unduh">
          <Table
            loading={isLoading || isFetching}
            pagination={{
              position: ["bottomRight", "topRight"],
              showTotal: (total) => `Total ${total} data`,
              current: query?.page,
              pageSize: query?.limit,
              total: data?.total,
              onChange: (page) => {
                setQuery({
                  ...query,
                  page,
                });
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
