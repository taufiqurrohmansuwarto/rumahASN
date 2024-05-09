import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { useRouter } from "next/router";

const AsnDiscussions = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Discussion Detail</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/asn-connect/asn-discussions")}
        title="ASN Discussion Detail"
      >
        detail
      </PageContainer>
    </>
  );
};

AsnDiscussions.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnDiscussions.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnDiscussions;
