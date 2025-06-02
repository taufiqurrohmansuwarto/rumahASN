import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { useRouter } from "next/router";
import BankJatimDetailLayananKPR from "@/components/LayananKeuangan/DetailLayanan/BankJatimDetailLayananKPR";
import { Grid } from "antd";

const KPR = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Layanan Keuangan - Bank Jatim - KPR</title>
      </Head>
      <PageContainer
        title="Layanan Keuangan"
        subTitle="Bank Jatim - KPR"
        onBack={handleBack}
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
      >
        <BankJatimDetailLayananKPR />
      </PageContainer>
    </>
  );
};

KPR.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim">
      {page}
    </LayananKeuanganLayout>
  );
};

KPR.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default KPR;
