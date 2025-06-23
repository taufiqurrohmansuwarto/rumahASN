import FormPengajuanKredit from "@/components/LayananKeuangan/BankJatim/FormPengajuanKredit";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Breadcrumb, Col, FloatButton, Row } from "antd";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const ApplyPengajuan = () => {
  useScrollRestoration();

  const router = useRouter();

  return (
    <PageContainer
      title="Pengajuan Kredit Bank Jatim"
      content="Ajukan kredit dengan mudah dan dapatkan persetujuan dalam waktu singkat"
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
          <Breadcrumb.Item>Pengajuan Kredit</Breadcrumb.Item>
        </Breadcrumb>
      )}
      onBack={() => router.back()}
    >
      <Head>
        <title>
          Rumah ASN - Layanan Keuangan - Bank Jatim - Pengajuan Kredit
        </title>
      </Head>
      <Row justify="center">
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <FloatButton.BackTop />
          <GoogleReCaptchaProvider
            reCaptchaKey={`6LdyNGorAAAAAN1UD8BNieu6WEvzVClmCnoZUnQk`}
          >
            <FormPengajuanKredit />
          </GoogleReCaptchaProvider>
        </Col>
      </Row>
    </PageContainer>
  );
};

ApplyPengajuan.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim/produk/kkb">
      {page}
    </LayananKeuanganLayout>
  );
};

ApplyPengajuan.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default ApplyPengajuan;
