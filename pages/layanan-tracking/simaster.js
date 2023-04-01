import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Card } from "antd";

function TrackingSIMASTER() {
  return (
    <PageContainer title="Layanan Tracking" subTitle="Aplikasi SIMASTER">
      <Card></Card>
    </PageContainer>
  );
}

TrackingSIMASTER.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

TrackingSIMASTER.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TrackingSIMASTER;
