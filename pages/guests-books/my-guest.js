import GuestBookLayout from "@/components/GuestBook/GuestBookLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";
import GuestBookMyGuest from "@/components/GuestBook/GuestBookMyGuest";
function GuestBookMyGuests() {
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
        title="Kunjungan Saya"
        content="Kunjungan Saya"
      >
        <GuestBookMyGuest />
      </PageContainer>
    </>
  );
}

GuestBookMyGuests.Auth = {
  action: "manage",
  subject: "GuestBook",
};

GuestBookMyGuests.getLayout = function getLayout(page) {
  return <GuestBookLayout active="my-guest">{page}</GuestBookLayout>;
};

export default GuestBookMyGuests;
