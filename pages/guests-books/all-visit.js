import GuestBookLayout from "@/components/GuestBook/GuestBookLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function GuestBookAllVisited() {
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
        title="Semua Kunjungan"
        content="Semua Kunjungan"
      ></PageContainer>
    </>
  );
}

GuestBookAllVisited.Auth = {
  action: "manage",
  subject: "GuestBook",
};

GuestBookAllVisited.getLayout = function getLayout(page) {
  return <GuestBookLayout active="all-visit">{page}</GuestBookLayout>;
};

export default GuestBookAllVisited;
