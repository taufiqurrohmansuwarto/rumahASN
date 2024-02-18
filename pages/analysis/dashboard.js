import DataTickets from "@/components/Dashboards/DataTickets";
import PlotAdminTickets from "@/components/Dashboards/PlotAdminTickets";
import PlotAgeUsers from "@/components/Dashboards/PlotAgeUsers";
import UserByGroup from "@/components/Dashboards/UserByGroupCard";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Card, Col, Row } from "antd";
import Head from "next/head";

function DashboardAnalysis() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Dashboard</title>
      </Head>
      <PageContainer title="Dashboard" subTitle="Analisis Data Rumah ASN">
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col md={8} xs={24}>
            <Card title="Statistik Pertanyaan">
              <DataTickets />
            </Card>
          </Col>
          <Col md={8} xs={24}>
            <Card title="Statistik Pengguna">
              <UserByGroup />
            </Card>
          </Col>
        </Row>
        <PlotAgeUsers />
        <PlotAdminTickets />
      </PageContainer>
    </>
  );
}

DashboardAnalysis.getLayout = function getLayout(page) {
  return <Layout active="/analysis/dashboard">{page}</Layout>;
};

DashboardAnalysis.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default DashboardAnalysis;
