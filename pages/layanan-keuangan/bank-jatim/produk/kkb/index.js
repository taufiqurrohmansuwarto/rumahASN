import BankJatimLayout from "@/components/LayananKeuangan/BankJatim/BankJatimLayout";
import BankJatimDetailLayananKKB from "@/components/LayananKeuangan/DetailLayanan/BankJatimDetailLayananKKB";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Link from "next/link";

const KKB = () => {
  useScrollRestoration();
  return (
    <PageContainer
      title="Partner Bank Jatim - Kredit Kendaraan Bermotor"
      content="Wujudkan impian memiliki kendaraan dengan kredit yang mudah dan terpercaya dari Bank Jatim"
      breadcrumbRender={() => (
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/layanan-keuangan/dashboard">Beranda</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/layanan-keuangan/bank-jatim/produk/kkb">
              Bank Jatim
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Kredit Kendaraan Bermotor</Breadcrumb.Item>
        </Breadcrumb>
      )}
    >
      <Head>
        <title>
          Rumah ASN - Layanan Keuangan - Bank Jatim - Kredit Kendaraan Bermotor
        </title>
      </Head>
      <BankJatimLayout active="kkb">
        <BankJatimDetailLayananKKB />
      </BankJatimLayout>
    </PageContainer>
  );
};

KKB.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim/produk/kkb">
      {page}
    </LayananKeuanganLayout>
  );
};

KKB.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default KKB;
