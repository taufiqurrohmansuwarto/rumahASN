import PageContainer from "@/components/PageContainer";
import KominfoServicesLayout from "@/components/KominfoServices/KominfoServicesLayout";
import Head from "next/head";

const KominfoServicesDashboardPage = () => {
  return (
    <>
      <Head>
        <title>Beranda - Layanan Kominfo Jatim</title>
        <meta name="description" content="Dashboard layanan Kominfo Jatim" />
      </Head>
      <PageContainer
        title="Beranda Layanan Kominfo Jatim"
        subTitle="Selamat datang di portal layanan Kominfo Jawa Timur"
      >
        <div>
          <h1>Dashboard</h1>
        </div>
      </PageContainer>
    </>
  );
};

KominfoServicesDashboardPage.getLayout = function getLayout(page) {
  return (
    <KominfoServicesLayout active="/kominfo-services/dashboard">
      {page}
    </KominfoServicesLayout>
  );
};

KominfoServicesDashboardPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default KominfoServicesDashboardPage;
