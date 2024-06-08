import Layout from "@/components/Layout";

const LayananSiasnPemberhentian = () => {
  return <div>helo</div>;
};

LayananSiasnPemberhentian.getLayout = function (page) {
  return (
    <Layout active="/apps-managements/siasn-services/pemberhentian">
      {page}
    </Layout>
  );
};

LayananSiasnPemberhentian.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LayananSiasnPemberhentian;
