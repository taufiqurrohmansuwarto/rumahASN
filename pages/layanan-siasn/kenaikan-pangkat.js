import LayananSIASNLayout from "@/components/LayananSIASNAdmin/LayananSIASNLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function KenaikanPangkatLayananSIASN() {
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
        <div>Kenaikan Pangkat</div>
      </PageContainer>
    </>
  );
}

KenaikanPangkatLayananSIASN.getLayout = function getLayout(page) {
  return (
    <LayananSIASNLayout active="/layanan-siasn/kenaikan-pangkat">
      {page}
    </LayananSIASNLayout>
  );
};

KenaikanPangkatLayananSIASN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default KenaikanPangkatLayananSIASN;
