import Layout from "@/components/Layout";

const LayananSiasnKenaikanPangkat = () => {
  return <div>helo</div>;
};

LayananSiasnKenaikanPangkat.getLayout = function (page) {
  return (
    <Layout active="/apps-managements/siasn-services/kenaikan-pangkat">
      {page}
    </Layout>
  );
};

LayananSiasnKenaikanPangkat.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LayananSiasnKenaikanPangkat;
