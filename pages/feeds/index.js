import BannerBKD from "../../src/components/BannerBKD";
import CustomerDashboard from "../../src/components/CustomerDashboard";
import Greeting from "../../src/components/Greeting";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";

function Feeds() {
  return (
    <PageContainer title="Beranda" subTitle="Feeds">
      <Greeting />
      {/* <BannerBKD /> */}
      <CustomerDashboard />
    </PageContainer>
  );
}

Feeds.Auth = {
  action: "manage",
  subject: "Feeds",
};

Feeds.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default Feeds;
