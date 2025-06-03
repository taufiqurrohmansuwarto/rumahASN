import DashboardKomparasiAdmin from "@/components/Fasilitator/DashboardKomparasiAdmin";
import DashboardKompareFasilitator from "@/components/Fasilitator/DashboardKompareFasilitator";
import DashboardDimensiAccuracy from "@/components/Fasilitator/KualitasData/DashboardDimensiAccuracy";
import DashboardDimensiCompleteness from "@/components/Fasilitator/KualitasData/DashboardDimensiCompleteness";
import DashboardDimensiConsistency from "@/components/Fasilitator/KualitasData/DashboardDimensiConsistency";
import DashboardDimensiTimeliness from "@/components/Fasilitator/KualitasData/DashboardDimensiTimeliness";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Grid } from "antd";
import { useSession } from "next-auth/react";
import Head from "next/head";

const RekonAnomali = () => {
  useScrollRestoration();

  const { data: session } = useSession();

  const admin = session?.user?.current_role === "admin";
  const fasilitator = session?.user?.role === "FASILITATOR";

  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Disparitas Data</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Disparitas Data"
        content="Disparitas data antara SIASN dan SIMASTER"
      >
        {admin && <DashboardKomparasiAdmin />}
        {fasilitator && <DashboardKompareFasilitator />}

        <DashboardDimensiAccuracy />
        <DashboardDimensiCompleteness />
        <DashboardDimensiConsistency />
        <DashboardDimensiTimeliness />
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
