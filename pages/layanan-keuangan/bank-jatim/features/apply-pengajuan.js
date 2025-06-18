import FormPengajuanKredit from "@/components/LayananKeuangan/BankJatim/FormPengajuanKredit";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Col, Grid, Row } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const { breakpoint } = Grid;

const ApplyPengajuan = () => {
  useScrollRestoration();

  const router = useRouter();

  return (
    <PageContainer
      title="Pengajuan Kredit Bank Jatim"
      subTitle="Ajukan kredit dengan mudah dan dapatkan persetujuan dalam waktu singkat"
      onBack={() => router.back()}
    >
      <Head>
        <title>Layanan Keuangan - Bank Jatim - Pengajuan Kredit</title>
      </Head>
      <Row justify="center">
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <FormPengajuanKredit />
        </Col>
      </Row>
    </PageContainer>
  );
};

ApplyPengajuan.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim">
      {page}
    </LayananKeuanganLayout>
  );
};

ApplyPengajuan.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default ApplyPengajuan;
