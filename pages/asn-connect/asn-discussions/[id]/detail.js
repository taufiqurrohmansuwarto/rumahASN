import DetailDiscussion from "@/components/Discussions/DetailDiscussion";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Card, Grid, Breadcrumb } from "antd";
import Link from "next/link";
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
        onBack={() => router.back()}
        title="Diskusi ASN"
        content="Detail Diskusi"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/asn-connect/asn-updates">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/asn-connect/asn-discussions">Diskusi ASN</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Diskusi</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <DetailDiscussion />
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
