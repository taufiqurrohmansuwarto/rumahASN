import BankJatimDetailLayananMultiguna from "@/components/LayananKeuangan/DetailLayanan/BankJatimDetailLayananMultiguna";
import BankJatimLayout from "@/components/LayananKeuangan/BankJatim/BankJatimLayout";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";

const Multiguna = () => {
  useScrollRestoration();
  return (
    <PageContainer>
      <Head>
        <title>Layanan Keuangan - Bank Jatim - Multiguna</title>
      </Head>
      <BankJatimLayout active="multiguna">
        <BankJatimDetailLayananMultiguna />
      </BankJatimLayout>
    </PageContainer>
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
