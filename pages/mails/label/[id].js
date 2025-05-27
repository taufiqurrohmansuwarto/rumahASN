import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const Label = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Label Pesan</title>
      </Head>
      <PageContainer>
        <div>
          <h1>Label Pesan</h1>
        </div>
      </PageContainer>
    </>
  );
};

Label.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/label">{page}</GmailLayout>;
};

Label.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Label;
