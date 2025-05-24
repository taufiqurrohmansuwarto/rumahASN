import GmailLayout from "@/components/GmailLayout";
import EmailComposer from "@/components/mail/EmailComposer";
import Head from "next/head";
import { useRouter } from "next/router";

const ComposeMail = () => {
  const router = useRouter();

  const handleBack = () => router?.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Buat Pesan</title>
      </Head>
      <EmailComposer
        visible={true}
        onClose={handleBack}
        onSent={handleBack}
        mode="compose"
      />
    </>
  );
};

ComposeMail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/compose">{page}</GmailLayout>;
};

ComposeMail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ComposeMail;
