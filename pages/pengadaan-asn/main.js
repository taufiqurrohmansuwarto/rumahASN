import PageContainer from "@/components/PageContainer";
import DaftarPeserta from "@/components/PengadaanASN/DaftarPeserta";
import PengadaanASNLayout from "@/components/PengadaanASN/PengadaanASNLayout";
import { Grid } from "antd";
import Head from "next/head";

function BerandaPengadaanASN() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Buku Tamu</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Beranda Pengadaan ASN"
        content="Beranda Pengadaan ASN"
      >
        <DaftarPeserta />
      </PageContainer>
    </>
  );
}

BerandaPengadaanASN.Auth = {
  action: "manage",
  subject: "GuestBook",
};

BerandaPengadaanASN.getLayout = function getLayout(page) {
  return <PengadaanASNLayout active="beranda">{page}</PengadaanASNLayout>;
};

export default BerandaPengadaanASN;
