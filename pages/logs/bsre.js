import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import ReactJson from "@/components/ReactJson";
import { dataSealById, logBsreSeal } from "@/services/log.services";
import { formatDateFull } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  Card,
  Collapse,
  Modal,
  Skeleton,
  Space,
  Table,
  Tag,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

function LogBSRE() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const [itemIid, setItemIid] = useState(null);

  const { data: dataResponseSeal, isLoading: isLoadingSeal } = useQuery(
    ["data-seal", itemIid],
    () => dataSealById(itemIid),
    {
      enabled: !!itemIid,
    }
  );

  const { data, isLoading, isFetching } = useQuery(
    ["log-bsre-seal", query],
    () => logBsreSeal(query),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const showModalInformation = (item) => {
    setItemIid(item?.id);
    Modal.info({
      title: "Detail Log Seal BSrE",
      centered: true,
      onCancel: () => setItemIid(null),
      width: 800,
      content: (
        <Skeleton loading={isLoadingSeal}>
          {dataResponseSeal && (
            <Collapse>
              <Collapse.Panel header="Request Data" key="1">
                <div
                  style={{
                    maxHeight: 400,
                    overflow: "auto",
                  }}
                >
                  <ReactJson
                    src={JSON?.parse(dataResponseSeal?.request_data)}
                  />
                </div>
              </Collapse.Panel>
              <Collapse.Panel header="Response Data" key="2">
                <div
                  style={{
                    maxHeight: 400,
                    overflow: "auto",
                  }}
                >
                  <ReactJson
                    src={JSON?.parse(dataResponseSeal?.response_data)}
                  />
                </div>
              </Collapse.Panel>
            </Collapse>
          )}
        </Skeleton>
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
      title: "Aksi",
      dataIndex: "action",
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
              color={item?.status === "SUCCESS" ? "green" : "red"}
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
    {
      title: "Aksi",
      key: "aksi",
      render: (item) => (
        <a onClick={() => showModalInformation(item)}>detail</a>
      ),
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
  return <Layout active="/logs/bsre">{page}</Layout>;
};

LogBSRE.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LogBSRE;
