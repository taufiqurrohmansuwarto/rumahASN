import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import Head from "next/head";
import BankJatimDetailLayananKPR from "@/components/LayananKeuangan/DetailLayanan/BankJatimDetailLayananKPR";
import BankJatimLayout from "@/components/LayananKeuangan/BankJatim/BankJatimLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import PageContainer from "@/components/PageContainer";

const KPR = () => {
  useScrollRestoration();
  return (
    <PageContainer>
      <Head>
        <title>Layanan Keuangan - Bank Jatim - KPR</title>
      </Head>
      <BankJatimLayout active="kpr">
        <BankJatimDetailLayananKPR />
      </BankJatimLayout>
    </PageContainer>
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
