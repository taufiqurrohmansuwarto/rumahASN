import BankJatimLayout from "@/components/LayananKeuangan/BankJatim/BankJatimLayout";
import BankJatimDetailLayananKKB from "@/components/LayananKeuangan/DetailLayanan/BankJatimDetailLayananKKB";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";

const KKB = () => {
  useScrollRestoration();
  return (
    <PageContainer>
      <Head>
        <title>Layanan Keuangan - Bank Jatim - KKB</title>
      </Head>
      <BankJatimLayout active="kkb">
        <BankJatimDetailLayananKKB />
      </BankJatimLayout>
    </PageContainer>
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
