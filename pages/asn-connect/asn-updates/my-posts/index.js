import Layout from "@/components/Layout";
import LayoutAsnConnect from "@/components/LayoutASNConnect";
import PageContainer from "@/components/PageContainer";
import SocmedTabs from "@/components/Socmed/SocmedTabs";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { BackTop } from "antd";
import Head from "next/head";

const AsnUpdatesMyPosts = () => {
  useScrollRestoration();
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Update</title>
      </Head>
      <PageContainer title="ASN Updates" content="Postingan Saya">
        <BackTop />
        <SocmedTabs />
      </PageContainer>
    </>
  );
};

AsnUpdatesMyPosts.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnUpdatesMyPosts.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnUpdatesMyPosts;
