import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import SocmedTabs from "@/components/Socmed/SocmedTabs";
import EletterBKD from "@/components/Utils/EletterBKD";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { FloatButton } from "antd";
import Head from "next/head";

const AsnUpdates = () => {
  useScrollRestoration();

  // create link whatssapmessage

  return (
    <>
      <Head>
        <title>Rumah ASN - Smart ASN Connect Update</title>
      </Head>
      <LayoutASNConnect>
        <SocmedTabs />
        <FloatButton.BackTop />
        <EletterBKD />
      </LayoutASNConnect>
    </>
  );
};

AsnUpdates.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnUpdates.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnUpdates;
