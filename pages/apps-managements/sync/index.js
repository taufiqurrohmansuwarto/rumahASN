import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import SinkronMaster from "@/components/Sinkron/SinkronMaster";

const Sync = () => {
  return (
    <PageContainer
      title="Sinkron Data"
    >
      <SinkronMaster />
    </PageContainer>
  );
};

Sync.getLayout = (page) => <Layout>{page}</Layout>;

Sync.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Sync;
