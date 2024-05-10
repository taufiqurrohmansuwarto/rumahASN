import DetailDiscussion from "@/components/Discussions/DetailDiscussion";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Card, Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const AsnDiscussions = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Discussion Detail</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={() => router.push("/asn-connect/asn-discussions")}
        title="ASN Discussion Detail"
      >
        <Card>
          <DetailDiscussion />
        </Card>
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
