import Layout from "@/components/Layout";
import CompareSKP22 from "@/components/PemutakhiranData/CompareSKP22";
import LayoutPemutakhiranData from "@/components/PemutakhiranData/LayoutPemutakhiranData";
import Head from "next/head";

const SKP22 = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - SKP 2022</title>
      </Head>
      <CompareSKP22 />
    </>
  );
};

SKP22.Auth = {
  action: "manage",
  subject: "Tickets",
};

SKP22.getLayout = (page) => {
  return (
    <Layout active="/pemutakhiran-data/data-utama">
      <LayoutPemutakhiranData active="4">{page}</LayoutPemutakhiranData>
    </Layout>
  );
};

export default SKP22;
