import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { getAnnouncements } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import Head from "next/head";
import React from "react";

function Announcements() {
  const { data, isLoading } = useQuery(
    ["announcements"],
    () => getAnnouncements(),
    {}
  );
  return (
    <>
      <Head>
        <title>Pengumuman</title>
      </Head>
      <PageContainer title="Pengumuman" subTitle="Pengumuman Rumah ASN">
        <Card loading={isLoading}>
          <div>{JSON.stringify(data)}</div>
        </Card>
      </PageContainer>
    </>
  );
}

Announcements.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

Announcements.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Announcements;
