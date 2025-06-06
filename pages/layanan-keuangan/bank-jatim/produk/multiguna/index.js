import BankJatimDetailLayananMultiguna from "@/components/LayananKeuangan/DetailLayanan/BankJatimDetailLayananMultiguna";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { useRouter } from "next/router";
import { Grid } from "antd";

const Multiguna = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Layanan Keuangan - Bank Jatim - Multiguna</title>
      </Head>
      <PageContainer
        title="Layanan Keuangan"
        subTitle="Bank Jatim - Multiguna"
        onBack={handleBack}
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
      >
        <BankJatimDetailLayananMultiguna />
      </PageContainer>
    </>
  );
};

Multiguna.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim">
      {page}
    </LayananKeuanganLayout>
  );
};

Multiguna.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default Multiguna;
