import DashboardKomparasiAdmin from "@/components/Fasilitator/DashboardKomparasiAdmin";
import DashboardKompareFasilitator from "@/components/Fasilitator/DashboardKompareFasilitator";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { useSession } from "next-auth/react";
import Head from "next/head";

const RekonAnomali = () => {
  const { data: session } = useSession();

  const admin = session?.user?.current_role === "admin";
  const fasilitator = session?.user?.role === "FASILITATOR";

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Disparitas Data</title>
      </Head>
      <PageContainer
        title="Disparitas Data"
        content="Disparitas data antara SIASN dan SIMASTER"
      >
        {admin && <DashboardKomparasiAdmin />}
        {fasilitator && <DashboardKompareFasilitator />}
      </PageContainer>
    </>
  );
};

RekonAnomali.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

RekonAnomali.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonAnomali;
