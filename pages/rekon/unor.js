import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import RekonUnorSIASN from "@/components/Rekon/RekonUnorSIASN";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Breadcrumb, Grid } from "antd";
import Link from "next/link";

const RekonUnor = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekonisiliasi - Unit Organisasi</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/rekon/dashboard">Rekonisiliasi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/rekon/dashboard">Dashboard</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Unit Organisasi</Breadcrumb.Item>
          </Breadcrumb>
        )}
        title="Rekonisiliasi Unit Organisasi"
        content="Validasi dan sinkronisasi data unit organisasi"
        subTitle="Kelola kesesuaian data struktur organisasi dengan SIASN"
      >
        <RekonUnorSIASN />
      </PageContainer>
    </>
  );
};

RekonUnor.getLayout = (page) => {
  return <RekonLayout active="/rekon/unor">{page}</RekonLayout>;
};

RekonUnor.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonUnor;
