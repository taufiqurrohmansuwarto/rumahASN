import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const Dokumen = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Dokumen</title>
      </Head>
      <PageContainer title="Rekon" content="Dokumen"></PageContainer>
    </>
  );
};

Dokumen.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

Dokumen.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Dokumen;
