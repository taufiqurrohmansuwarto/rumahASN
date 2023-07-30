import Layout from "@/components/Layout";
import CompareDataUtama from "@/components/PemutakhiranData/CompareDataUtama";
import LayoutPemutakhiranData from "@/components/PemutakhiranData/LayoutPemutakhiranData";
import Head from "next/head";

const DataUtama = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Utama</title>
      </Head>
      <CompareDataUtama />
    </>
  );
};

DataUtama.Auth = {
  action: "manage",
  subject: "Tickets",
};

DataUtama.getLayout = (page) => {
  return (
    <Layout active="/pemutakhiran-data/data-utama">
      <LayoutPemutakhiranData>{page}</LayoutPemutakhiranData>
    </Layout>
  );
};

export default DataUtama;
