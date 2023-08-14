import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { MenuMySAPK } from "@/components/PemutakhiranData/MenuMySAPK";
import Head from "next/head";
import React from "react";

function Komparasi() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan - Komparasi</title>
      </Head>
      <PageContainer
        title="Komparasi"
        subTitle="Komparasi Data"
        content="Peremajaan Data SIASN dan SIMASTER"
      >
        <MenuMySAPK />
      </PageContainer>
    </>
  );
}

Komparasi.Auth = {
  action: "manage",
  subject: "Tickets",
};

Komparasi.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/data-utama">{page}</Layout>;
};

export default Komparasi;
