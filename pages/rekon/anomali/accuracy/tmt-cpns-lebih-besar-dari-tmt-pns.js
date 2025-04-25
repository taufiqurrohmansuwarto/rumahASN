import TmtCpnsLebihBesarDariTmtPns from "@/components/Fasilitator/KualitasData/Accuracy/TmtCpnsLebihBesarDariTmtPns";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const AccuracyTmtCpnsLebihBesarDariTmtPns = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>
          Rumah ASN - Kualitas Data - TMT CPNS Lebih Besar Dari TMT PNS
        </title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Accuracy - TMT CPNS Lebih Besar Dari TMT PNS"
        content="TMT CPNS lebih besar dari TMT PNS"
      >
        <TmtCpnsLebihBesarDariTmtPns />
      </PageContainer>
    </>
  );
};

AccuracyTmtCpnsLebihBesarDariTmtPns.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

AccuracyTmtCpnsLebihBesarDariTmtPns.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AccuracyTmtCpnsLebihBesarDariTmtPns;
