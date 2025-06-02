import BankJatimDashboard from "@/components/LayananKeuangan/BankJatimDashboard";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { Grid } from "antd";

const BankJatim = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Layanan Keuangan - Bank Jatim</title>
      </Head>
      <PageContainer
        title="Layanan Keuangan"
        subTitle="Bank Jatim"
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
      >
        <BankJatimDashboard />
      </PageContainer>
    </>
  );
};

BankJatim.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim">
      {page}
    </LayananKeuanganLayout>
  );
};

BankJatim.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default BankJatim;
