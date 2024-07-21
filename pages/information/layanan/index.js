import InformationLayout from "@/components/Information/InformationLayout";
import Layout from "@/components/Layout";
import InformasiDaftarLayanan from "@/components/PusatBantuan/InformasiDaftarLayanan";
import Head from "next/head";

function Layanan() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Informasi - Layanan</title>
      </Head>
      <InformationLayout
        active="layanan"
        title="Informasi Rumah ASN"
        content="Layanan yang tersedia"
      >
        <InformasiDaftarLayanan />
      </InformationLayout>
    </>
  );
}

Layanan.Auth = {
  action: "manage",
  subject: "Feeds",
};

Layanan.getLayout = function getLayout(page) {
  return <Layout active="/information/faq">{page}</Layout>;
};

export default Layanan;
