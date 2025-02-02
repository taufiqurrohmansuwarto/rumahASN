import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import DaftarPegawai from "@/components/Rekon/DaftarPegawai";
import Head from "next/head";

const HukumanDisiplin = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Pegawai</title>
      </Head>
      <PageContainer title="Rekon" content="Pegawai">
        <DaftarPegawai />
      </PageContainer>
    </>
  );
};

HukumanDisiplin.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

HukumanDisiplin.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default HukumanDisiplin;
