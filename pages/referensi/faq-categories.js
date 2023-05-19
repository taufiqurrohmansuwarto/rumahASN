import Layout from "@/components/Layout";
import Head from "next/head";

function ReferensiFaqCategories() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Referensi - FAQ Category</title>
      </Head>
    </>
  );
}

ReferensiFaqCategories.getLayout = function getLayout(page) {
  return <Layout active="/referensi/status">{page}</Layout>;
};

ReferensiFaqCategories.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default ReferensiFaqCategories;
