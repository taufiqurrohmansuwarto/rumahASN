import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const Sent = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Terkirim</title>
      </Head>
      <PageContainer>
        <div>
          <h1>Pesan Terkirim</h1>
        </div>
      </PageContainer>
    </>
  );
};

Sent.getLayout = function getLayout(page) {
  return <GmailLayout active="sent">{page}</GmailLayout>;
};

Sent.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Sent;
