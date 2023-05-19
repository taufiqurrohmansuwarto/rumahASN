import Layout from "@/components/Layout";
import Head from "next/head";

function ReferensiCategories() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Referensi - Categories</title>
      </Head>
    </>
  );
}

ReferensiCategories.getLayout = function getLayout(page) {
  return <Layout active="/referensi/status">{page}</Layout>;
};

ReferensiCategories.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default ReferensiCategories;
