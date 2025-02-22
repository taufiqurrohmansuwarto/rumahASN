import LayananSIASNLayout from "@/components/LayananSIASNAdmin/LayananSIASNLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function PengadaanLayananSIASN() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Layanan SIASN</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? null : "24px",
        }}
        title="Layanan SIASN"
        subTitle="Integrasi Layanan SIASN"
      >
        <div>Pengadaan</div>
      </PageContainer>
    </>
  );
}

PengadaanLayananSIASN.getLayout = function getLayout(page) {
  return (
    <LayananSIASNLayout active="/layanan-siasn/pengadaan">
      {page}
    </LayananSIASNLayout>
  );
};

PengadaanLayananSIASN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default PengadaanLayananSIASN;
