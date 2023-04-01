import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Card } from "antd";

function TrackingSIASN() {
  return (
    <PageContainer title="Layanan Tracking" subTitle="Aplikasi SIASN">
      <Card></Card>
    </PageContainer>
  );
}

TrackingSIASN.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

TrackingSIASN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TrackingSIASN;
