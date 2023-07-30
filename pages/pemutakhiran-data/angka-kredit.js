import Layout from "@/components/Layout";
import CompareAngkaKredit from "@/components/PemutakhiranData/CompareAngkaKredit";
import LayoutPemutakhiranData from "@/components/PemutakhiranData/LayoutPemutakhiranData";
import Head from "next/head";

const AngkaKredit = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Angka Kredit</title>
      </Head>
      <CompareAngkaKredit />
    </>
  );
};

AngkaKredit.Auth = {
  action: "manage",
  subject: "Tickets",
};

AngkaKredit.getLayout = (page) => {
  return (
    <Layout active="/pemutakhiran-data/data-utama">
      <LayoutPemutakhiranData active="3">{page}</LayoutPemutakhiranData>
    </Layout>
  );
};

export default AngkaKredit;
