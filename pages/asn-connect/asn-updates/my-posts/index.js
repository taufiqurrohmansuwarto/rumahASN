import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import SocmedTabs from "@/components/Socmed/SocmedTabs";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { FloatButton } from "antd";
import Head from "next/head";

const AsnUpdatesMyPosts = () => {
  useScrollRestoration();
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Update</title>
      </Head>
      <LayoutASNConnect>
        <FloatButton.BackTop />
        <SocmedTabs />
      </LayoutASNConnect>
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
