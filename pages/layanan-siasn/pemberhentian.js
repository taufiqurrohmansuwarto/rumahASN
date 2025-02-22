import LayananSIASNLayout from "@/components/LayananSIASNAdmin/LayananSIASNLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function PemberhentianLayananSIASN() {
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
        <div>Pemberhentian</div>
      </PageContainer>
    </>
  );
}

PemberhentianLayananSIASN.getLayout = function getLayout(page) {
  return (
    <LayananSIASNLayout active="/layanan-siasn/pemberhentian">
      {page}
    </LayananSIASNLayout>
  );
};

PemberhentianLayananSIASN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default PemberhentianLayananSIASN;
