import GuestBookLayout from "@/components/GuestBook/GuestBookLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function GuestBookCheckOut() {
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

GuestBookCheckOut.Auth = {
  action: "manage",
  subject: "GuestBook",
};

GuestBookCheckOut.getLayout = function getLayout(page) {
  return <GuestBookLayout active="check-out">{page}</GuestBookLayout>;
};

export default GuestBookCheckOut;
