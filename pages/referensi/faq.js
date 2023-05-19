import Layout from "@/components/Layout";
import Head from "next/head";

function ReferensiFaq() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Referensi - Pertanyaan Umum</title>
      </Head>
    </>
  );
}

ReferensiFaq.getLayout = function getLayout(page) {
  return <Layout active="/referensi/status">{page}</Layout>;
};

ReferensiFaq.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default ReferensiFaq;
