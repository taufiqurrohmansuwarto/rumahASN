import DashboardKomparasiAdmin from "@/components/Fasilitator/DashboardKomparasiAdmin";
import DashboardKompareFasilitator from "@/components/Fasilitator/DashboardKompareFasilitator";
import DashboardDimensiCompleteness from "@/components/Fasilitator/KualitasData/DashboardDimensiCompleteness";
import DashboardDimensiConsistency from "@/components/Fasilitator/KualitasData/DasboardDimenisConsistency";
import DashboardDimensiAccuracy from "@/components/Fasilitator/KualitasData/DashboardDimensiAccuracy";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { Grid } from "antd";
import useScrollRestoration from "@/hooks/useScrollRestoration";

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
        <DashboardDimensiCompleteness />
        <DashboardDimensiConsistency />
        <DashboardDimensiAccuracy />
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
