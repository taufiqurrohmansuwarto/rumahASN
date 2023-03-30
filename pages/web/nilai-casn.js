import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import NilaiWeb from "@/components/Web/NilaiWeb";
import { Card } from "antd";

function NilaiCASN() {
  return (
    <PageContainer title="Pengumuman Nilai" subTitle="PPPK atau CPNS">
      <Card>
        <NilaiWeb />
      </Card>
    </PageContainer>
  );
}

NilaiCASN.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

NilaiCASN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default NilaiCASN;
