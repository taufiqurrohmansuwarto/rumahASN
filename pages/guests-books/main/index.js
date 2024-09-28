import GuestBookLayout from "@/components/GuestBook/GuestBookLayout";
import GuestsBookUser from "@/components/GuestBook/GuestsBookUser";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

function GuestBook() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Buku Tamu</title>
      </Head>
      <PageContainer>
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
  return <GuestBookLayout active="main">{page}</GuestBookLayout>;
};

export default GuestBook;
