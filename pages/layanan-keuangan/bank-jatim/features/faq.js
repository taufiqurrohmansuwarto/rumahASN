import BankJatimFAQ from "@/components/LayananKeuangan/BankJatim/BankJatimFAQ";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Col, Row } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const FAQ = () => {
  useScrollRestoration();

  const router = useRouter();

  return (
    <PageContainer
      title="Pertanyaan yang Sering Diajukan"
      subTitle="Temukan jawaban atas pertanyaan umum seputar layanan kredit Bank Jatim"
      onBack={() => router.back()}
    >
      <Head>
        <title>Layanan Keuangan - Bank Jatim - FAQ</title>
      </Head>
      <Row justify="center">
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <BankJatimFAQ />
        </Col>
      </Row>
    </PageContainer>
  );
};

FAQ.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim">
      {page}
    </LayananKeuanganLayout>
  );
};

FAQ.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default FAQ;
