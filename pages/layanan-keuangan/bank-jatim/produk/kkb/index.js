import BankJatimDetailLayananKKB from "@/components/LayananKeuangan/DetailLayanan/BankJatimDetailLayananKKB";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { useRouter } from "next/router";
import { Grid } from "antd";

const KKB = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Layanan Keuangan - Bank Jatim - KKB</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
        title="Layanan Keuangan"
        subTitle="Bank Jatim - KKB"
        onBack={handleBack}
      >
        <BankJatimDetailLayananKKB />
      </PageContainer>
    </>
  );
};

KKB.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim">
      {page}
    </LayananKeuanganLayout>
  );
};

KKB.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default KKB;
