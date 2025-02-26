import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid, Breadcrumb } from "antd";
import Head from "next/head";

const RekonDashboard = () => {
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Dashboard</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Dashboard"
        content="Dashboard Rekon"
        breadcrumbRender={() => {
          return (
            <Breadcrumb>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>List</Breadcrumb.Item>
              <Breadcrumb.Item>App</Breadcrumb.Item>
            </Breadcrumb>
          );
        }}
      ></PageContainer>
    </>
  );
};

RekonDashboard.getLayout = (page) => {
  return <RekonLayout active="/rekon/dashboard">{page}</RekonLayout>;
};

RekonDashboard.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonDashboard;
