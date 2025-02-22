import LayananSIASNLayout from "@/components/LayananSIASNAdmin/LayananSIASNLayout";
import LayananPemberhentian from "@/components/LayananSIASNAdmin/LayananPemberhentian";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { Grid } from "antd";

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
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/layanan-siasn/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Pemberhentian</Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/layanan-siasn/kenaikan-pangkat">
                  Kenaikan Pangkat
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/layanan-siasn/pengadaan">Pengadaan</Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <LayananPemberhentian />
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
