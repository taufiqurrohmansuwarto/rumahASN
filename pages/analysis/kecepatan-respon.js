import Layout from "@/components/Layout";
import Head from "next/head";

function KecepatanResponse() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Kecepatan Respon</title>
      </Head>
    </>
  );
}

KecepatanResponse.getLayout = function getLayout(page) {
  return <Layout active="/analysis/kecepatan-respon">{page}</Layout>;
};

KecepatanResponse.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default KecepatanResponse;
