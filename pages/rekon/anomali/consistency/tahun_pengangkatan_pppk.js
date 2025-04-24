import TahunPengangkatanPPPK from "@/components/Fasilitator/KualitasData/Consistency/TahunPengangkatanPPPK";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const ConsistencyTahunPengangkatanPPPK = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const gotoRekonAnomali = () => {
    router.push("/rekon/anomali");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Kualitas Data - Tahun Pengangkatan PPPK</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={gotoRekonAnomali}
        title="Dimensi Consistency - Tahun Pengangkatan PPPK"
        content="Tahun Pengangkatan PPPK"
      >
        <TahunPengangkatanPPPK />
      </PageContainer>
    </>
  );
};

ConsistencyTahunPengangkatanPPPK.getLayout = (page) => {
  return <RekonLayout active="/rekon/anomali">{page}</RekonLayout>;
};

ConsistencyTahunPengangkatanPPPK.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ConsistencyTahunPengangkatanPPPK;
