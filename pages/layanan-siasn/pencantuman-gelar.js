import LayananSIASNLayout from "@/components/LayananSIASNAdmin/LayananSIASNLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { Grid } from "antd";
import LayananPencantumanGelar from "@/components/LayananSIASNAdmin/LayananPencantumanGelar";

function PencantumanGelarLayananSIASN() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Layanan SIASN</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Layanan SIASN"
        subTitle="Integrasi Layanan SIASN"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/layanan-siasn/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Pencantuman Gelar</Breadcrumb.Item>
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
        <LayananPencantumanGelar />
      </PageContainer>
    </>
  );
}

PencantumanGelarLayananSIASN.getLayout = function getLayout(page) {
  return (
    <LayananSIASNLayout active="/layanan-siasn/pencantuman-gelar">
      {page}
    </LayananSIASNLayout>
  );
};

PencantumanGelarLayananSIASN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default PencantumanGelarLayananSIASN;
