import GuestBookCheckOut from "@/components/GuestBook/GuestBookCheckOut";
import GuestBookLayout from "@/components/GuestBook/GuestBookLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function GuestBookCheckOuts() {
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
      >
        <GuestBookCheckOut />
      </PageContainer>
    </>
  );
}

GuestBookCheckOuts.Auth = {
  action: "manage",
  subject: "GuestBook",
};

GuestBookCheckOuts.getLayout = function getLayout(page) {
  return <GuestBookLayout active="check-out">{page}</GuestBookLayout>;
};

export default GuestBookCheckOuts;
