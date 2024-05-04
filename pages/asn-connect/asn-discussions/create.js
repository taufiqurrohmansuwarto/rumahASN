import CreateDiscussion from "@/components/Discussions/CreateDiscussion";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { useRouter } from "next/router";

const AsnCreateDiscussion = () => {
  const router = useRouter();
  const handleBack = () => router.back();
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Discussion Create</title>
      </Head>
      <PageContainer
        content="Buat Diskusi"
        onBack={handleBack}
        title="Buat Diskusi"
      >
        <CreateDiscussion />
      </PageContainer>
    </>
  );
};

AsnCreateDiscussion.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnCreateDiscussion.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnCreateDiscussion;
