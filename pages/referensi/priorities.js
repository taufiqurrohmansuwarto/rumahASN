import Layout from "@/components/Layout";
import Head from "next/head";

function ReferensiPrioritas() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Referensi - Priorities</title>
      </Head>
    </>
  );
}

ReferensiPrioritas.getLayout = function getLayout(page) {
  return <Layout active="/referensi/status">{page}</Layout>;
};

ReferensiPrioritas.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default ReferensiPrioritas;
