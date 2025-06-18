import FormSimulasi from "@/components/LayananKeuangan/BankJatim/FormSimulasi";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Col, Row } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const SimulasiKredit = () => {
  useScrollRestoration();

  const router = useRouter();

  return (
    <PageContainer
      title="Simulasi Kredit"
      onBack={() => router.back()}
      subTitle="Simulasi kredit dengan mudah dan dapatkan persetujuan dalam waktu singkat"
    >
      <Head>
        <title>Layanan Keuangan - Bank Jatim - Simulasi Kredit</title>
      </Head>
      <Row justify="center">
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <FormSimulasi />
        </Col>
      </Row>
    </PageContainer>
  );
};

SimulasiKredit.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim">
      {page}
    </LayananKeuanganLayout>
  );
};

SimulasiKredit.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default SimulasiKredit;
