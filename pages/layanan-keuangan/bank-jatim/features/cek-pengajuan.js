import FormCekPengajuanKredit from "@/components/LayananKeuangan/BankJatim/FormCekPengajuanKredit";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Breadcrumb, Col, Row } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";

const CekPengajuan = () => {
  useScrollRestoration();

  const router = useRouter();

  return (
    <PageContainer
      title="Cek Status Pengajuan Kredit"
      content="Pantau perkembangan pengajuan kredit Anda secara real-time"
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
          <Breadcrumb.Item>Cek Pengajuan</Breadcrumb.Item>
        </Breadcrumb>
      )}
      onBack={() => router.back()}
    >
      <Head>
        <title>Layanan Keuangan - Bank Jatim - Cek Pengajuan</title>
      </Head>
      <Row justify="center">
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <FormCekPengajuanKredit />
        </Col>
      </Row>
    </PageContainer>
  );
};

CekPengajuan.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim/produk/kkb">
      {page}
    </LayananKeuanganLayout>
  );
};

CekPengajuan.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default CekPengajuan;
