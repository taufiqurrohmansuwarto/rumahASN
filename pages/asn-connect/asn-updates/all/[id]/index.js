import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import SocmedComments from "@/components/Socmed/SocmedComments";
import { getPost } from "@/services/socmed.services";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, FloatButton, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const ASNUpdateDetail = () => {
  const router = useRouter();
  const handleBack = () => router?.back();

  const { id } = router.query;

  const { data: post, isLoading } = useQuery(
    ["socmed-posts", id],
    () => getPost(id),
    {}
  );

  // Gunakan scroll restoration hook
  useScrollRestoration("asnUpdateDetailScroll");

  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>ASN Update - Detail </title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="ASN Connect"
        content="Tempat ASN Jatim Saling Bantu"
        onBack={handleBack}
        loading={isLoading}
      >
        <FloatButton.BackTop />
        <SocmedComments id={id} post={post} />
      </PageContainer>
    </>
  );
};

ASNUpdateDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

ASNUpdateDetail.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default ASNUpdateDetail;
