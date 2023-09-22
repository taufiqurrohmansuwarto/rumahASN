import Layout from "@/components/Layout";
import { logSIASN } from "@/services/log.services";
import { useQuery } from "@tanstack/react-query";
import { BackTop, Breadcrumb, Input, Table } from "antd";
import { useState } from "react";
import moment from "moment";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import Link from "next/link";

function LogSIASN() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 50,
  });

  const { data, isLoading, isFetching } = useQuery(
    ["logs-siasn", query],
    () => logSIASN(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const handleSearch = (e) => {
    setQuery({
      ...query,
      employeeNumber: e,
    });
  };

  const columns = [
    {
      title: "Aktor",
      key: "actor",
      render: (text) => <>{text?.user?.username}</>,
    },
    {
      title: "Aksi",
      dataIndex: "type",
    },
    {
      title: "Layanan",
      dataIndex: "siasn_service",
    },
    {
      title: "NIP",
      dataIndex: "employee_number",
    },
    {
      title: "Tgl. Dibuat",
      key: "created_at",
      render: (text) => (
        <>{moment(text?.created_at).format("DD MMM YYYY HH:mm:ss")}</>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Log SIASN</title>
      </Head>
      <PageContainer
        title="Log"
        subTitle="Layanan SIASN"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/integrasi/siasn">
                  <a>Integrasi SIASN</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Log</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <BackTop />
        <Table
          title={() => (
            <Input.Search
              allowClear
              onSearch={handleSearch}
              placeholder="NIP"
              style={{
                width: 300,
              }}
            />
          )}
          pagination={{
            showSizeChanger: false,
            position: ["bottomRight", "topRight"],
            current: query?.page,
            pageSize: query?.limit,
            total: data?.total,
            onChange: (page, limit) => {
              setQuery({
                ...query,
                page,
                limit,
              });
            },
          }}
          columns={columns}
          loading={isLoading || isFetching}
          dataSource={data?.data}
          rowKey={(row) => row?.id}
        />
      </PageContainer>
    </>
  );
}

LogSIASN.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/logs/siasn">{page}</Layout>;
};

LogSIASN.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LogSIASN;
