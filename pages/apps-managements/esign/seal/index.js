import RequestSealActivation from "@/components/Esign/RequestSealActivation";
import AdminSeal from "@/components/Esign/Seal/AdminSeal";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Stack } from "@mantine/core";
import Head from "next/head";

const SegelElektronik = () => {
  return (
    <>
      <Head>
        <title>Segel Elektronik</title>
      </Head>
      <PageContainer title="E-Sign" content="Segel Elektronik">
        <RequestSealActivation />
        <div style={{ marginTop: 10 }}>
          <AdminSeal />
        </div>
      </PageContainer>
    </>
  );
};

SegelElektronik.Auth = {
  action: "manage",
  subject: "Tickets",
};

SegelElektronik.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/esign/seal">{page}</Layout>;
};

export default SegelElektronik;
