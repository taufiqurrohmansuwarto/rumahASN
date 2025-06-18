import BankJatimRiwayatPengajuan from "@/components/LayananKeuangan/BankJatim/BankJatimRiwayatPengajuan";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Col, Row } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const RiwayatPengajuan = () => {
  useScrollRestoration();

  const router = useRouter();

  return (
    <PageContainer
      title="📋 Riwayat Perjalanan Kredit Anda"
      subTitle="Lacak setiap langkah pengajuan kredit dengan mudah dan transparan"
      onBack={() => router.back()}
    >
      <Head>
        <title>Layanan Keuangan - Bank Jatim - Riwayat Pengajuan Kredit</title>
      </Head>
      <Row justify="center">
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <BankJatimRiwayatPengajuan />
        </Col>
      </Row>
    </PageContainer>
  );
};

RiwayatPengajuan.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim">
      {page}
    </LayananKeuanganLayout>
  );
};

RiwayatPengajuan.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default RiwayatPengajuan;
