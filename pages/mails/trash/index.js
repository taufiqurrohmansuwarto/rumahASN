import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const Trash = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Sampah Pesan</title>
      </Head>
      <PageContainer>
        <div>
          <h1>Sampah Pesan</h1>
        </div>
      </PageContainer>
    </>
  );
};

Trash.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/trash">{page}</GmailLayout>;
};

Trash.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Trash;
