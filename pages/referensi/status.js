import Layout from "@/components/Layout";
import Head from "next/head";

function ReferensiStatus() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Referensi - Status</title>
      </Head>
    </>
  );
}

ReferensiStatus.getLayout = function getLayout(page) {
  return <Layout active="/referensi/status">{page}</Layout>;
};

ReferensiStatus.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default ReferensiStatus;
