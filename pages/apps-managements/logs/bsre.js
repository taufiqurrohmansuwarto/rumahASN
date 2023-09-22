import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { logBsre } from "@/services/log.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Table } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

function LogBSRE() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 25,
  });

  const { data, isLoading } = useQuery(["log-bsre"], () => logBsre(query), {
    keepPreviousData: true,
    enabled: !!query,
  });

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
        {JSON.stringify(data)}
        <Table dataSource={data?.data} />
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
