import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import ProxySinkronisasiComponent from "@/components/Rekon/ProxySinkronisasi";
import Head from "next/head";

const ProxySinkronisasi = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Proxy Sinkronisasi</title>
      </Head>
      <PageContainer title="Rekon" content="Proxy Sinkronisasi">
        <ProxySinkronisasiComponent />
      </PageContainer>
    </>
  );
};

ProxySinkronisasi.getLayout = (page) => {
  return <RekonLayout active="/rekon/proxy-sinkronisasi">{page}</RekonLayout>;
};

ProxySinkronisasi.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ProxySinkronisasi;
