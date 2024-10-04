import GuestBookLayout from "@/components/GuestBook/GuestBookLayout";
import GuestsBookUser from "@/components/GuestBook/GuestsBookUser";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function GuestBook() {
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
        title="Buku Tamu"
        content="Buku Tamu"
      >
        <GuestsBookUser />
      </PageContainer>
    </>
  );
}

GuestBook.Auth = {
  action: "manage",
  subject: "GuestBook",
};

GuestBook.getLayout = function getLayout(page) {
  return <GuestBookLayout active="visits">{page}</GuestBookLayout>;
};

export default GuestBook;
