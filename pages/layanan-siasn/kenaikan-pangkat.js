import LayananSIASNLayout from "@/components/LayananSIASNAdmin/LayananSIASNLayout";
import LayananKenaikanPangkat from "@/components/LayananSIASNAdmin/LayananKenaikanPangkat";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { Grid } from "antd";
import useScrollRestoration from "@/hooks/useScrollRestoration";

function KenaikanPangkatLayananSIASN() {
  useScrollRestoration();
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <FloatButton.BackTop />
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
        <LayananKenaikanPangkat />
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
