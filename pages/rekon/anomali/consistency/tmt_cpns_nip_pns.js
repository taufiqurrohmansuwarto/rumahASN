import TmtCpnsNipPns from "@/components/Fasilitator/KualitasData/Consistency/TmtCpnsNipPns";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const ConsistencyTmtCpnsNipPns = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Kualitas Data - Tmt CPNS NIP PNS</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Consistency - Tmt CPNS NIP PNS"
        content="Tmt CPNS NIP PNS"
      >
        <TmtCpnsNipPns />
      </PageContainer>
    </>
  );
};

ConsistencyTmtCpnsNipPns.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

ConsistencyTmtCpnsNipPns.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ConsistencyTmtCpnsNipPns;
