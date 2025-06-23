import DetailLayananPengadaan from "@/components/LayananSIASNAdmin/DetailLayananPengadaan";
import LayananSIASNLayout from "@/components/LayananSIASNAdmin/LayananSIASNLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function DetailPengadaanLayananSIASN() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Detail Layanan SIASN</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title="Detail Pengadaan SIASN"
        subTitle="Informasi lengkap data pengadaan pegawai"
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
        <DetailLayananPengadaan />
      </PageContainer>
    </>
  );
}

DetailPengadaanLayananSIASN.getLayout = function getLayout(page) {
  return (
    <LayananSIASNLayout active="/layanan-siasn/pengadaan">
      {page}
    </LayananSIASNLayout>
  );
};

DetailPengadaanLayananSIASN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default DetailPengadaanLayananSIASN;
