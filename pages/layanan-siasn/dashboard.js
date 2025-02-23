import LayananSIASNLayout from "@/components/LayananSIASNAdmin/LayananSIASNLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function DashboardLayananSIASN() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Layanan SIASN</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Layanan SIASN"
        subTitle="Integrasi Layanan SIASN"
      >
        <div>Dashboard</div>
      </PageContainer>
    </>
  );
}

DashboardLayananSIASN.getLayout = function getLayout(page) {
  return (
    <LayananSIASNLayout active="/layanan-siasn/dashboard">
      {page}
    </LayananSIASNLayout>
  );
};

DashboardLayananSIASN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default DashboardLayananSIASN;
