import FormCekPengajuanKredit from "@/components/LayananKeuangan/BankJatim/FormCekPengajuanKredit";
import FormPengajuanKredit from "@/components/LayananKeuangan/BankJatim/FormPengajuanKredit";
import FormSimulasi from "@/components/LayananKeuangan/BankJatim/FormSimulasi";
import PingBankJatim from "@/components/LayananKeuangan/BankJatim/PingBankJatim";
import BankJatimDashboard from "@/components/LayananKeuangan/BankJatimDashboard";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import { Grid, Row, Col } from "antd";
import Head from "next/head";

const { useBreakpoint } = Grid;

const BankJatim = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  return (
    <>
      <Head>
        <title>Layanan Keuangan - Bank Jatim</title>
      </Head>
      <PageContainer title="Layanan Keuangan" subTitle="Bank Jatim">
        <Row gutter={[16, 16]}>
          {/* Dashboard - Full width */}
          <Col span={24}>
            <BankJatimDashboard />
          </Col>

          {/* Ping Connection - Full width on mobile, half on desktop */}
          <Col xs={24} lg={12}>
            <PingBankJatim />
          </Col>

          {/* Form Simulasi */}
          <Col xs={24} lg={12}>
            <FormSimulasi />
          </Col>

          {/* Form Cek Pengajuan */}
          <Col xs={24} lg={12}>
            <FormCekPengajuanKredit />
          </Col>

          {/* Form Pengajuan Kredit */}
          <Col xs={24} lg={12}>
            <FormPengajuanKredit />
          </Col>
        </Row>
      </PageContainer>
    </>
  );
};

BankJatim.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/bank-jatim">
      {page}
    </LayananKeuanganLayout>
  );
};

BankJatim.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default BankJatim;
