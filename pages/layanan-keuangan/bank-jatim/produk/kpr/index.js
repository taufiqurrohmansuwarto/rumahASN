import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import Head from "next/head";
import BankJatimDetailLayananKPR from "@/components/LayananKeuangan/DetailLayanan/BankJatimDetailLayananKPR";
import BankJatimLayout from "@/components/LayananKeuangan/BankJatim/BankJatimLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Link from "next/link";

const KPR = () => {
  useScrollRestoration();

  return (
    <PageContainer
      title="Partner Bank Jatim - Kredit Pemilikan Rumah (KPR)"
      content="Wujudkan impian memiliki rumah dengan solusi KPR yang fleksibel dan terpercaya dari Bank Jatim"
      breadcrumbRender={() => (
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/layanan-keuangan/dashboard">Beranda</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/layanan-keuangan/bank-jatim/produk/kpr">
              Bank Jatim
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Kredit Perumahan</Breadcrumb.Item>
        </Breadcrumb>
      )}
    >
      <Head>
        <title>
          Rumah ASN - Layanan Keuangan - Bank Jatim - Kredit Perumahan
        </title>
      </Head>
      <BankJatimLayout active="kpr">
        <BankJatimDetailLayananKPR />
      </BankJatimLayout>
    </PageContainer>
  );
};

KPR.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim/produk/kkb">
      {page}
    </LayananKeuanganLayout>
  );
};

KPR.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default KPR;
