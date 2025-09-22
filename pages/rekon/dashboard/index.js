import PageContainer from "@/components/PageContainer";
import RekonDashboardDetail from "@/components/Rekon/RekonDashboardDetail";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Breadcrumb } from "antd";
import Head from "next/head";

const RekonDashboard = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Dashboard</title>
      </Head>
      <PageContainer
        breadcrumbRender={() => {
          return (
            <>
              <Breadcrumb>
                <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
              </Breadcrumb>
            </>
          );
        }}
      >
        <RekonDashboardDetail />
      </PageContainer>
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
