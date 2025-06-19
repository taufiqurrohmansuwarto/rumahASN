import BankJatimDetailLayananMultiguna from "@/components/LayananKeuangan/DetailLayanan/BankJatimDetailLayananMultiguna";
import BankJatimLayout from "@/components/LayananKeuangan/BankJatim/BankJatimLayout";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, FloatButton } from "antd";
import Link from "next/link";

const Multiguna = () => {
  useScrollRestoration();
  return (
    <PageContainer
      title="Partner Bank Jatim - Kredit Multiguna"
      content="Wujudkan berbagai kebutuhan finansial Anda dengan solusi kredit multiguna yang fleksibel dan terpercaya dari Bank Jatim"
      breadcrumbRender={() => (
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/layanan-keuangan/dashboard">Beranda</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/layanan-keuangan/bank-jatim/produk/multiguna">
              Bank Jatim
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Kredit Multiguna</Breadcrumb.Item>
        </Breadcrumb>
      )}
    >
      <Head>
        <title>
          Rumah ASN - Layanan Keuangan - Bank Jatim - Kredit Multiguna
        </title>
      </Head>
      <BankJatimLayout active="multiguna">
        <FloatButton.BackTop />
        <BankJatimDetailLayananMultiguna />
      </BankJatimLayout>
    </PageContainer>
  );
};

Multiguna.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim/produk/kkb">
      {page}
    </LayananKeuanganLayout>
  );
};

Multiguna.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default Multiguna;
