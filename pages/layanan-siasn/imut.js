import LayananSIASNLayout from "@/components/LayananSIASNAdmin/LayananSIASNLayout";
import LayananKenaikanPangkat from "@/components/LayananSIASNAdmin/LayananKenaikanPangkat";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { Grid } from "antd";

function ImutLayananSIASN() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Layanan SIASN - Daftar Kenaikan Pangkat</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Kenaikan Pangkat SIASN"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/layanan-siasn/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Kenaikan Pangkat</Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/layanan-siasn/pemberhentian">Pemberhentian</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/layanan-siasn/pengadaan">Pengadaan</Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <div>Imut</div>
      </PageContainer>
    </>
  );
}

ImutLayananSIASN.getLayout = function getLayout(page) {
  return (
    <LayananSIASNLayout active="/layanan-siasn/imut">{page}</LayananSIASNLayout>
  );
};

ImutLayananSIASN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ImutLayananSIASN;
