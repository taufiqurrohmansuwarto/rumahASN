import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const Snoozed = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Ditunda</title>
      </Head>
      <PageContainer>
        <div>
          <h1>Pesan Ditunda</h1>
        </div>
      </PageContainer>
    </>
  );
};

Snoozed.getLayout = function getLayout(page) {
  return <GmailLayout active="snoozed">{page}</GmailLayout>;
};

Snoozed.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Snoozed;
