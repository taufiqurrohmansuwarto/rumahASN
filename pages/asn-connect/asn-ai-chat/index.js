import Layout from "@/components/Layout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import Head from "next/head";

const AsnUpdates = () => {
  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - Smart ASN Connect Update</title>
      </Head>
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
