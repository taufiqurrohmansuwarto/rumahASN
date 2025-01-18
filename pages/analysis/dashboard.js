import DataTickets from "@/components/Dashboards/DataTickets";
import PlotAdminTickets from "@/components/Dashboards/PlotAdminTickets";
import PlotAgeUsers from "@/components/Dashboards/PlotAgeUsers";
import QuestionByDepartment from "@/components/Dashboards/QuestionByDepartment";
import UserByDepartment from "@/components/Dashboards/UserByDepartment";
import UserByGroup from "@/components/Dashboards/UserByGroupCard";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Card, Col, Grid, Row } from "antd";
import Head from "next/head";

function DashboardAnalysis() {
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Dashboard</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Dashboard"
        subTitle="Analisis Data Rumah ASN"
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col md={12} xs={24}>
            <Card title="Statistik Pertanyaan">
              <DataTickets />
            </Card>
          </Col>
          <Col md={12} xs={24}>
            <Card title="Statistik Pengguna">
              <UserByGroup />
            </Card>
          </Col>

          <Col md={24} xs={24}>
            <UserByDepartment />
          </Col>
          <Col md={24} xs={24}>
            <QuestionByDepartment />
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
