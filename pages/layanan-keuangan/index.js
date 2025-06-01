import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import { Button } from "antd";
import Head from "next/head";

const LayananKeuangan = () => {
  return (
    <>
      <Head>
        <title>Layanan Keuangan</title>
      </Head>
      <PageContainer>
        <div>Hello world</div>
        <Button type="primary">Click me</Button>
      </PageContainer>
    </>
  );
};

LayananKeuangan.getLayout = function getLayout(page) {
  return <LayananKeuanganLayout active="/">{page}</LayananKeuanganLayout>;
};

LayananKeuangan.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default LayananKeuangan;
