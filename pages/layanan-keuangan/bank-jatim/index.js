import BankJatimDashboard from "@/components/LayananKeuangan/BankJatimDashboard";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const BankJatim = () => {
  return (
    <>
      <Head>
        <title>Layanan Keuangan - Bank Jatim</title>
      </Head>
      <PageContainer title="Layanan Keuangan" subTitle="Bank Jatim">
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
