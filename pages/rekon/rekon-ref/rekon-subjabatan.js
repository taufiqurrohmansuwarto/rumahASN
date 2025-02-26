import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonSubJabatanSIASN from "@/components/Rekon/RekonSubJabatan";
import Head from "next/head";
import { Grid } from "antd";

const RekonSubJabatan = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Rekon Sub Jabatan</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Rekon"
        content="Sub Jabatan"
      >
        <RekonSubJabatanSIASN />
      </PageContainer>
    </>
  );
};

RekonSubJabatan.getLayout = (page) => {
  return <RekonLayout active="/rekon/rekon-subjabatan">{page}</RekonLayout>;
};

RekonSubJabatan.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonSubJabatan;
