import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";

const RekonJenisJabatan = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Rekon Jenis Jabatan</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Rekon"
        content="Jenis Jabatan"
      >
        <div>Rekon jenis jabatan</div>
      </PageContainer>
    </>
  );
};

RekonJenisJabatan.getLayout = (page) => {
  return <RekonLayout active="/rekon/rekon-jenis-jabatan">{page}</RekonLayout>;
};

RekonJenisJabatan.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonJenisJabatan;
