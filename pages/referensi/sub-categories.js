import Layout from "@/components/Layout";
import Head from "next/head";

function ReferensiSubCategories() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Referensi - Sub Categories</title>
      </Head>
    </>
  );
}

ReferensiSubCategories.getLayout = function getLayout(page) {
  return <Layout active="/referensi/status">{page}</Layout>;
};

ReferensiSubCategories.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default ReferensiSubCategories;
