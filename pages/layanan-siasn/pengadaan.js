import LayananSIASNLayout from "@/components/LayananSIASNAdmin/LayananSIASNLayout";
import LayananPengadaan from "@/components/LayananSIASNAdmin/LayananPengadaan";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import { Grid } from "antd";
import Head from "next/head";
import Link from "next/link";

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
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/layanan-siasn/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Pengadaan</Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/layanan-siasn/pemberhentian">Pemberhentian</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/layanan-siasn/kenaikan-pangkat">
                  Kenaikan Pangkat
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <LayananPengadaan />
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
