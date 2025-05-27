import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const Starred = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Ditandai</title>
      </Head>
      <PageContainer>
        <div>
          <h1>Pesan Ditandai</h1>
        </div>
      </PageContainer>
    </>
  );
};

Starred.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/starred">{page}</GmailLayout>;
};

Starred.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Starred;
