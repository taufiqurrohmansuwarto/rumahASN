import CreateDiscussion from "@/components/Discussions/CreateDiscussion";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { Breadcrumb, Grid, Row } from "antd";

const AsnCreateDiscussion = () => {
  const router = useRouter();
  const handleBack = () => router.back();
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Discussion Create</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        title="Buat Diskusi"
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Tugas Saya</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
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
