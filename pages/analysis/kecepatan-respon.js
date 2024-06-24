import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function KecepatanResponse() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Kecepatan Respon</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Analisis"
        subTitle="Kecepatan Respon"
      ></PageContainer>
    </>
  );
}

KecepatanResponse.getLayout = function getLayout(page) {
  return <Layout active="/analysis/kecepatan-respon">{page}</Layout>;
};

KecepatanResponse.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default KecepatanResponse;
